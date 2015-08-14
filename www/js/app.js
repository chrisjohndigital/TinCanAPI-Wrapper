var ModelItem = Backbone.Model.extend({
    defaults: {
		tinCanReporting: true,
		lrsendpoint: '',
		lrsversion: '',
		lrskey: '',
		lrssecret: '',
		lrsusername: '',
		lrsmbox: '',
    }
});
var TinCanModelTracking = Backbone.View.extend({ 
	el: null,
	model: null,
	myTinCan: null,
	myLRS: null,
    initialize: function(){
		if (this.model.get('tinCanReporting')==true) {
			_.bindAll(this, 'render', 'connectToLRS', 'createActor', 'returnVerbStatement', 'createObjectDefinition', 'sendStatement');
			this.render();
		}
	},
	render: function(){
		this.connectToLRS();
		this.createActor();
		var verb = this.returnVerbStatement('experienced');
		var objectDefinition = this.createObjectDefinition($(this.el).find('h1').first().text(),$(this.el).find('p').first().text());
		this.sendStatement (objectDefinition, verb);
	},
	connectToLRS: function(){
		this.myTinCan = new TinCan();
		this.myLRS = new TinCan.LRS({
			endpoint:this.model.get('lrsendpoint'), 
			version: this.model.get('lrsversion'),
			auth: 'Basic ' + Base64.encode(this.model.get('lrskey') + ':' + this.model.get('lrssecret'))
		});
		this.myTinCan.recordStores[0] = this.myLRS;
	},
	createActor: function() {
		var myActor = new TinCan.Agent({
			name : this.model.get('lrsusername'),
			mbox : this.model.get('lrsmbox')
		});
		this.myTinCan.actor = myActor;
	},
	returnVerbStatement: function(verb) {
		switch(verb)
		{
			case ('experienced'):
				var myVerb = new TinCan.Verb({
				id : 'http://adlnet.gov/expapi/verbs/experienced',		
				display : {
					'en-US':'experienced', 
					'en-GB':'experienced'
					}
				});
				return (myVerb);
			break;
		}
	},
	createObjectDefinition: function(activityName, activityDescription) {
		var myObjectDefinition = new TinCan.ActivityDefinition({
			name : {
				'en-US':activityName, 
				'en-GB':activityName
			},
			description : {
				'en-US':activityDescription, 
				'en-GB':activityDescription
			}
		});
		return (myObjectDefinition);
	},
	sendStatement: function (objectDefinition, myVerb) {		
		var myObject = new TinCan.Activity({
			id : window.location.href,
			definition : objectDefinition
		});
		var stmt = new TinCan.Statement({
			verb : myVerb,
			object : myObject
		},false);
		this.myTinCan.sendStatement(stmt, function() {
			console.log('TinCan callback');
		});
	}
});
$(document).ready(function() {
	(function($){
		var modelItem = new ModelItem();
		var tincanModelTracking = new TinCanModelTracking({
			model: modelItem,
			el: $('body')
		});
	})(jQuery);
});
	