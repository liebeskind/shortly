window.Shortly = Backbone.View.extend({

  template: _.template(' \
      <h1>Shortly</h1> \
      <div class="navigation"> \
      <ul> \
        <li><a href="#" class="index">All Links</a></li> \
        <li><a href="#" class="create">Shorten</a></li> \
      </ul> \
      </div> \
      <div id="container"></div>'
  ),

  events: {  //we want the backbone router to take care of these events
    "click li a.index":  "renderIndexView",
    "click li a.create": "renderCreateView"
  },

  initialize: function(){
    console.log( "Shortly is running" );
    $('body').append(this.render().el);
    var that = this;

    this.AppRouter = Backbone.Router.extend({
        routes: {
            "index": "index",
            "shorten": "shorten"
        },
        index: function(){
          that.renderIndexView();
        },
        shorten: function(){
          that.renderCreateView();
        }
    });
    // Initiate the router
    this.app_router = new this.AppRouter();

    // Starts Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start({
        pushState: true
    });
  },

  render: function(){
    this.$el.html( this.template() );
    return this;
  },

  renderIndexView: function(e){
    this.app_router.navigate('#index');
    e && e.preventDefault();
    var links = new Shortly.Links();
    var linksView = new Shortly.LinksView( {collection: links} );
    this.$el.find('#container').html( linksView.render().el );
    this.updateNav('index');
  },

  renderCreateView: function(e){
    this.app_router.navigate('#shorten');
    e && e.preventDefault();
    var linkCreateView = new Shortly.LinkCreateView();
    this.$el.find('#container').html( linkCreateView.render().el );
    this.updateNav('create');
  },

  updateNav: function(className){
    this.$el.find('.navigation li a')
            .removeClass('selected')
            .filter('.'+className)
            .addClass('selected');
  }

});