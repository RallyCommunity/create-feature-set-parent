Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:[{
        xtype: 'container',
        itemId: 'initPickerContainer',
         layout: {
                type    : 'hbox',
                align   : 'stretch'
            },
            items: [{
                xtype   : 'container',
                itemId  :'container1',
                flex: 1,
                margins: 10
            },{
                xtype   : 'container',
                itemId  : 'container2',
                flex    : 1,
                margins: 10
            },{
                xtype: 'container',
                itemId:'container3',
                flex: 1,
                margins: 10
            }]
    }],
launch: function() {
    this.down('#container1').add({
        xtype: 'rallycombobox',
         itemId: 'inits',
        storeConfig: {
            model: 'PortfolioItem/Initiative',
            fetch: ['FormattedID','Name'],
            autoLoad: true,
            limit: Infinity
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
    this.down('#container2').add({
        xtype       : 'textareafield',
        itemId      : 'defaultDescription',
        grow        : true,
        value        : '<p>ACCEPTANCE CRITERIA</p><ul><li>one</li><li>two</li></ul>'      
    });
},
    
_onInitiativeSelected:function(initiative){
    this._initiativeRef = initiative.get('_ref');
    console.log(this._initiativeRef);
    if (!this.down('#createButton')){
        this.down('#container3').add({
            xtype:'rallybutton',
            text:'Create a Feature',
            itemId:'createButton',
            handler: function() {
                 this._getFeatureModel(); 
            },
            scope:this
            
        });
    }
},

_getFeatureModel:function(){
    var description = this.down('#defaultDescription').getValue();
    console.log('description',description);
        Rally.data.ModelFactory.getModel({
            type: 'PortfolioItem/Feature',
            success: function(model) {  
                this._model = model;
                var feature = Ext.create(model, {
                    Name: 'a good feature',
                    Description: description
                });
                feature.save({
                    callback: function(result, operation) {
                        if(operation.wasSuccessful()) {
                            console.log("_ref",result.get('_ref'), ' ', result.get('Name'));
                            this._record = result;
                            this._readAndUpdate();
                        }
                        else{
                            console.log("?");
                        }
                    },
                    scope:this
                });
            },
            scope:this
        });
},
     _readAndUpdate:function(){
        var id = this._record.get('ObjectID');
        console.log('OID', id);
        this._model.load(id,{
            fetch: ['Name', 'FormattedID','Parent'],
            callback: function(record, operation){
                console.log('Parent prior to update:', record.get('Parent'));
                record.set('Parent',this._initiativeRef);
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
            },
            scope:this
        });
    }
    
    
});
