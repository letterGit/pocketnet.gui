var tagcloud = (function(){

	var self = new nModule();

	var essenses = {};

	var Essense = function(p){

		var primary = deep(p, 'history');

		var el, showed = false, essenseData;

		var actions = {

		}

		var events = {
			
		}

		var renders = {
			showhide : function(){
				if(showed){
					el.c.addClass('showedalltags')
				}
				else{
					el.c.removeClass('showedalltags')
				}
			},
			tags : function(tags, clbk){


				var tagsmap = self.app.platform.sdk.categories.gettagsmap()
				var addedtags = [];


				_.each(tagsmap, function(v, i){

					if(_.indexOf(tags, i) == -1){
						addedtags.push({
							tag : i,
							count : 0
						})
					}

				})

				tags = tags.concat(addedtags)

				_.each(tags, function(t){
					t.count = Number(t.count || 0)
				})

				var maxcount = 0
				_.each(tags, function(t){
					if(t.count > maxcount) maxcount = t.count
				})

				maxcount++

				

				tags = _.sortBy(tags, function(tag){

					var bonus = 1
					var base = tag.count + 1

					if(tagsmap[tag.tag]){

						base = maxcount + (tag.count + 1)
						bonus = 100

						if(tagsmap[tag.tag].fixed){
							bonus = 2
						}
					}
					

					return -base * bonus

					
				})

				tags = _.uniq(tags, function(t){
					return t.tag
				})


				if(!tags.length){
					el.c.addClass('hidden')
				}
				else{

					el.c.removeClass('hidden')

					self.shell({

						name :  'tags',
						el : el.tags,
	
						data : {
							tags : tags,
							tagsmap : tagsmap
						},				
	
					}, function(p){

						renders.showhide()
	
						p.el.find('.showhidealltags').on('click', function(){
							showed = !showed
							renders.showhide()
							if(essenseData.renderclbk) essenseData.renderclbk()
						})

						p.el.find('.tagcheckgl').on('click', function(){
							var pr = $(this).closest('.tg')

							if (pr.hasClass('fixed')) return

							var id = pr.attr('tag')

							var r = self.app.platform.sdk.categories.tag(id)

						})

						if(essenseData.renderclbk) essenseData.renderclbk()
	
					
						if (clbk)
							clbk()
	
					})
				}

			} 
		}

		var state = {
			save : function(){

			},
			load : function(){
				
			}
		}

		var initEvents = function(){
			
			self.app.platform.sdk.categories.clbks.selected.tagsmodule = function(id, value, l){
				make()
				
			}	

			self.app.platform.sdk.categories.clbks.tags.tagsmodule = function(id, value, l){

				var e = el.c.find('.tg[tag="'+id+'"]')

				if(value) e.addClass('selected')
				else e.removeClass('selected')
			}	

		}

		var removeEvents = function(){
			delete self.app.platform.sdk.categories.clbks.tags.tagsmodule
			delete self.app.platform.sdk.categories.clbks.selected.tagsmodule
		}

		var load = function(clbk){
			
			self.app.platform.sdk.tags.cloud(function(tags, error){

				tags = self.app.platform.sdk.tags.filterEx(tags)


				if (clbk)
					clbk(tags, error)
					
			})

		}

		var make = function(){


			load(function(tags, error){

				if (error){

					self.iclbks.maintag = make

				}

				renders.tags(tags)

			})

		}

		return {
			primary : primary,

			getdata : function(clbk, p){
				essenseData = p.settings.essenseData || {};
				var data = {};


				clbk(data);

			},

			destroy : function(){
				delete self.iclbks.maintag;

				removeEvents()

				el = {};
			},
			
			init : function(p){


				state.load();

				el = {};
				el.c = p.el.find('#' + self.map.id);
				el.tags = el.c.find('.tags');

				initEvents();

				make()

				p.clbk(null, p);
			}
		}
	};



	self.run = function(p){

		var essense = self.addEssense(essenses, Essense, p);

		self.init(essense, p);

	};

	self.stop = function(){

		_.each(essenses, function(essense){

			essense.destroy();

		})

	}

	return self;
})();


if(typeof module != "undefined")
{
	module.exports = tagcloud;
}
else{

	app.modules.tagcloud = {};
	app.modules.tagcloud.module = tagcloud;

}