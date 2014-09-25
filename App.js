Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        var initiatives = Ext.create('Rally.ui.combobox.ComboBox',{
	    itemId: 'inits',
	    storeConfig: {
		model: 'PortfolioItem/Initiative',
		fetch: ['FormattedID','Name'],
		pageSize: 100,
		autoLoad: true
	    },
	    fieldLabel: 'select Initiative',
	    listeners:{
                ready: function(combobox){
		    if (combobox.getRecord()) {
			console.log('ready',combobox.getRecord().get('_ref'));
			this._onInitiativeSelected(combobox.getRecord());
		    }
		    else{
			console.log('selected release has no features');
			if (this.down('#grid')) {
			    this.down('#grid').destroy();
			}
		    }
		},
                select: function(combobox){
		    if (combobox.getRecord()) {
			console.log('select',combobox.getRecord().get('_ref'));
			this._onInitiativeSelected(combobox.getRecord());
		    }
			        
                },
                scope: this
            }
	});
	this.add(initiatives);
    },
    _onInitiativeSelected:function(initiative){
        this._initiativeRef = initiative.get('_ref');
        console.log(this._initiativeRef);
        if (!this.down('#createButton')) {
                 var that = this;
                 var cb = Ext.create('Ext.Container', {
            
                items: [
                    {
                        xtype  : 'rallybutton',
                        text    : 'Create a Feature, set its Parent to selected Initiative',
                        itemId: 'createButton',
                        handler: function() {
                            that._getFeatureModel(); 
                        }
                    }
                        
                    ]
                });
            this.add(cb);
            }
        
    },
    _getFeatureModel:function(){
        var that = this;
            Rally.data.ModelFactory.getModel({
                type: 'PortfolioItem/Feature',
                context: {
                    //workspace: '/workspace/1227940010'         //non default workspace
                    workspace: '/workspace/12352608129'         //default workspace
                },
                success: function(model) {  //success on model retrieved
                    that._model = model;
                    var feature = Ext.create(model, {
                        Name: 'a good feature',
                        Description: 'created via appsdk2rc2'
                    });
                    feature.save({
                        callback: function(result, operation) {
                            if(operation.wasSuccessful()) {
                                console.log("_ref",result.get('_ref'), ' ', result.get('Name'));
                                that._record = result;
                                that._readAndUpdate();
                            }
                            else{
                                console.log("?");
                            }
                        }
                    });
                }
            });
    },
     _readAndUpdate:function(){
        var that = this;
        var id = this._record.get('ObjectID');
        console.log('OID', id);
        this._model.load(id,{
            fetch: ['Name', 'FormattedID','Parent'],
            callback: function(record, operation){
                console.log('Parent prior to update:', record.get('Parent'));
                record.set('Parent',that._initiativeRef);
                record.save({
                    callback: function(record, operation) {
                        if(operation.wasSuccessful()) {
                            console.log('Parent after update:', record.get('Parent'));
                        }
                        else{
                            console.log("?");
                        }
                    }
                });
            }
        })
    }
    
    
});
