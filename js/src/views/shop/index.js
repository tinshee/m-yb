//找商家首页视图
define(function (require) {

    var _ = require('_');


    var PageView = require('views/com/pageview');
    var Select = require('views/com/selectview.js');

    var AppModel = require('models/appMd');
    var ShopList = require('./list');

    var appMd = new AppModel({id: 'p_shop', title: '找商家_延边站_生活通'});

    var ShopView = PageView.extend({
        id: appMd.get('id'),
        tagName: appMd.get('tagName'),
        className: appMd.get('className'),
        title: appMd.get('title'),
        initialize: function (ac, cj) {
            var _this = this;
            document.title = this.title;
            if (typeof ShopView.instance == "object") {
                return ShopView.instance;
            }
            ShopView.instance = this;
            _.bindAll(this, 'onrenderlist', 'oncatSelect','onlandRender' ,'onlandSelect', 'onNormore', 'oncatRender');
            ac.add(appMd);

            this.cj = cj;
            this.aParam = _.clone(cj);
            this.aParam['sort'] = '01';
            this.md = appMd;
            this.downing = false;
            this.hash = location.hash;
            this.render();
            this.setEvn();
            this.nomore = false;

            this.catSelect.on('selected', this.oncatSelect);
            this.catSelect.on('render', this.oncatRender);
            this.landSelect.on('selected', this.onlandSelect);
            this.landSelect.on('render', this.onlandRender);
           // this.landSelect.on('selected', this.onlandNamechange);
            this.shopList.on('nomore', this.onNormore);
            this.shopList.on('render', this.onrenderlist)
        },
        events: {
            'tap .category-sect': 'tapCategory',
            'tap .landmark-sect': 'tapLandmark',
            'tap .sorter1': 'tapSortDefault',
            'tap .sorter2': 'tapSortPrice'
        },
        render: function () {
            var _this = this;
            this.$el.attr('cid', this.cid);
            this.addScrollDom();
            this.addContent();
            this.setSorter(this.cj);
            return this;
        },
        rerender: function (cj) {

            if (location.hash == this.hash) return false;
            this.hash = location.hash;
            //app.loadding.show();
            this.nomore = false;
            this.shopList.rerender(cj);
            this.catSelect.rerender(cj);
            this.landSelect.rerender(cj);
            this.setSorter(cj);
            this.setEvn();

        },
        setEvn:function(){
            app.header.setTitle(appMd.get('title'));
            app.header.setBack('#index','首页');
        },
        setSorter: function (cj) {
            //if (cj.sort) {
                var sort = cj.sort;
                switch (sort) {
                    case '01':
                    {
                        this.sorter1.addClass('active');
                        this.sorter2.removeClass('active').find('.glyphicon ').removeClass().addClass('glyphicon glyphicon-arrow-up');
                        break;
                    }
                    case '05':
                    {
                        this.sorter1.removeClass('active');
                        this.sorter2.addClass('active').find('.glyphicon ').removeClass().addClass('glyphicon glyphicon-arrow-up');
                        break;
                    }
                    case '07':
                    {
                        this.sorter1.removeClass('active');
                        this.sorter2.addClass('active').find('.glyphicon ').removeClass().addClass('glyphicon glyphicon-arrow-down');
                        break;
                    }
                    default :
                    {
                        this.sorter1.addClass('active');
                        this.sorter2.removeClass('active').find('.glyphicon ').removeClass().addClass('glyphicon glyphicon-arrow-up');

                    }
               // }
            }
        },
        oncatSelect: function (model) {
            this.aParam['category_id'] = model.get('category_id');
            var newHash = '#/at/shop/index/' + this.getParam();
            this.$('.category-sect .text').text(model.get('category_name'));
            app.router.navigate(newHash, {trigger: true});

        },
        onlandSelect: function (model) {
            this.aParam['landmark_id'] = model.get('id');
            var newHash = '#/at/shop/index/' + this.getParam();
            this.$('.landmark-sect .text').text(model.get('name'));
            app.router.navigate(newHash, {trigger: true});
        },
        oncatRender: function () {
            if (this.catSelect.collection.findWhere({'selected': true})) {
                var name = this.catSelect.collection.findWhere({'selected': true}).get('category_name');
                this.$('.category-sect .text').text(name);
            }

        },
        onlandRender: function () {
            if (this.landSelect.collection.findWhere({'selected': true})) {
                var name = this.landSelect.collection.findWhere({'selected': true}).get('name');
                this.$('.landmark-sect .text').text(name);
            }

        },
        onlandNamechange: function (name) {

            this.$('.landmark-sect .text').text(name);
        },
        onNormore: function () {

            this.iscroll.off('scroll');
            this.nomore = true;
            this.more.html('已无更多');
            this.downing = false;
        },

        onrenderlist: function () {
            this.scrollerDom.append(this.shopList.el);
            this.addMoreDom();
            if (this.shopList.length == 0) {
                this.more.html('暂无内容')
            }
            else if (this.shopList.length <12) {
                this.more.html('已无更多');
            }
            this.renderIscroll();
            this.trigger('render');
        },
        getParam: function () {
            var param = '';
            var i = 0;
            _.each(this.aParam, function (v, k) {
                if (!i) {
                    param += k + '=' + v;
                } else {
                    param += '&' + k + '=' + v;
                }
                i++;
            });
            return param;
        },
        addCategorySelect: function () {
            this.catSelect = new Select({type: 1, cj: this.cj, url: app.api.categroy_list, tpl: 'tpl-category-select', listName: 'category_list', subListName: 'subcategory_list', title: '请选择分类'});
            $('body').append(this.catSelect.el)
        },
        addLandmarkSelect: function () {
            this.landSelect = new Select({type: 2, cj: this.cj, url: app.api.landmark_list, tpl: 'tpl-landmark-select', listName: 'landmark_list', subListName: 'sublandmark_list', title: '请选择地标'});//app.api.landmark_list, selectLandCollection
            $('body').append(this.landSelect.el)
        },
        tapCategory: function () {
            this.catSelect.pullUp();
        },
        tapLandmark: function () {
            this.landSelect.pullUp()
        },
        tapSortPrice: function (e) {

            var newHash = '';
            var btn = $(e.currentTarget);
            var icon = btn.find('.glyphicon');

            if (btn.hasClass('active')) {
                if (icon.hasClass('glyphicon-arrow-up')) {
                    icon.removeClass().addClass('glyphicon glyphicon-arrow-down');
                    btn.data('up', false);
                } else if (icon.hasClass('glyphicon-arrow-down')) {
                    icon.removeClass().addClass('glyphicon glyphicon-arrow-up ');
                    btn.data('up', true);
                }
            } else {
                btn.addClass('active').siblings().removeClass('active');
            }
            if (btn.data('up')) {
                this.aParam['sort'] = '05';

            } else {
                this.aParam['sort'] = '07';
            }
            newHash = '#/at/shop/index/' + this.getParam();
            app.router.navigate(newHash, {trigger: true});
            return false;
        },

        tapSortDefault: function (e) {
            //todo 改变list collection
            var btn = $(e.currentTarget);
            this.sorter2.data('up',true);
            btn.addClass('active').siblings().removeClass('active');

            this.aParam['sort'] = '01';
            var newHash = '#/at/shop/index/' + this.getParam();
            app.router.navigate(newHash, {trigger: true});
            return false;

        },
        addContent: function () {

            this.addList();
            this.addFilterDom();
            this.addSorterDom();
            this.addCategorySelect();
            this.addLandmarkSelect();
        },
        renderIscroll: function () {
            if (this.iscroll) {
                this.iscroll.refresh();
                return false;
            }
            var _this = this;

            this.iscroll = new IScroll(this.el, {
                click: true,
                scrollbars: true,
                //tap: true,
                fadeScrollbars: true,
                topOffset: 50,
                useTransition: true,
                probeType: 3

            });

            this.iscroll.on('scroll', function () {
                if (_this.nomore)  return false;

                if (Math.abs(this.y) > (this.scrollerHeight - this.wrapperHeight + 40)) {

                    if (!_this.downing) {
                        _this.downing = true;
                        _this.more.html('全力加载中');
                        _this.shopList.addMore(
                            function () {
                                _this.iscroll.refresh();
                                _this.more.html('下拉显示更多');
                                _this.downing = false;
                            }
                        );
                    }
                }
            });
        },
        addSorterDom: function () {
            this.sorter = $('<div class="list-sorter"> <a class="sect sorter1 float-r active">默认排序</a><a class="sect sorter2 float-r">人均消费<span class="glyphicon glyphicon-arrow-up"></span></a></div>');
            this.sorter1 = this.sorter.find('.sorter1');
            this.sorter2 = this.sorter.find('.sorter2');
            this.sorter2.data('up', true);
            this.scrollerDom.append(this.sorter);
        },
        addScrollDom: function () {
            this.scrollerDom = $('<div id="' + this.id + '_scroller" class="scroller"></div>');
            this.$el.append(this.scrollerDom);
        },
        addMoreDom: function () {
            if (this.$('.more')) {
                this.$('.more').remove();
            }
            this.more = $('<div class="more">下拉显示更多</div>');
            this.scrollerDom.append(this.more);
            this.hasMore = true;
        },
        addFilterDom: function () {

            this.filter = $('<div class="list-fileter"><a  class="sect category-sect"><span class="text">全部分类</span> <span class="glyphicon glyphicon-chevron-down"></span></a> <a class="sect landmark-sect"><span class="text">全部地标</span> <span class="glyphicon glyphicon-chevron-down"></span></a></div>');
            this.scrollerDom.append(this.filter);
        },
        addList: function () {
            this.shopList = new ShopList(this.cj);
        }

    });

    return ShopView
});