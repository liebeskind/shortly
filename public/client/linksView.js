Shortly.LinksView = Backbone.View.extend({

  className: 'links',

  orderedList: [],

  filter: '',

  template: _.template('<form><input class="text" type="text" name="url" autofocus= "autofocus"><input type="submit" value="Search"></form>'),


  initialize: function(){
    this.collection.on('sync', this.addAll, this);
    this.collection.fetch();
  },

  events: {
    "submit": "filterUrl"
  },

  filterUrl: function(e){
    e.preventDefault();
    var $form = this.$el.find('form .text');
    var searchRegExp = RegExp($form.val(), "i"); //turns the form submitted text into a RegEx for filtering
    this.orderedList.forEach(function(view){
      $(view.el).removeClass('hidden');
      if (!(searchRegExp.test(view.model.attributes.title) || searchRegExp.test(view.model.attributes.url))) {  //tests whether regex contained in title or url
        $(view.el).addClass('hidden');
      }
    }, this);
    $form.val('');
  },

  render: function() {
    this.$el.empty();
    this.$el.html( this.template() );
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