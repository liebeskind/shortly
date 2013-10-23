Shortly.LinksView = Backbone.View.extend({

  className: 'links',

  orderedList: [],

  initialize: function(){
    this.collection.on('sync', this.addAll, this);
    this.collection.fetch();
  },

  render: function() {
    this.$el.empty();
    return this;
  },

  addAll: function(){
    this.collection.forEach(this.addOne, this);
    this.orderedList.sort(function(a, b){
      console.log(a.model.attributes);
      return b.model.attributes.visits - a.model.attributes.visits;
    });
    console.log(this.orderedList);
    this.orderedList.forEach(function(view) {
      this.$el.append(view.render().el);
    }, this);
  },

  addOne: function(item){
    var view = new Shortly.LinkView( {model: item} );
    console.log(view);
    this.orderedList.push(view);
  }
});