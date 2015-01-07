BufferDetailView
================

BufferView of EasyUI grid component comes with the DetailView option now.

### USAGE
#1.Introduce the source
```
requirejs.config({
    baseUrl: '/js/lib',
    paths: {
        app:        '../app',
        jquery:     'jquery.min',
        easyui:     'jquery.easyui.min',
        bufferview: 'datagrid-bufferview'
    },
    shim: {
        'easyui': {
            exports: '$',
            deps: ['jquery']
        },
        'bufferview': {
            exports: 'bufferview',
            deps: ['easyui']  
        }
    }
})
```
#2.Put it into the field
```
$('#DataGrid').datagrid({
    view: bufferview,
    detailFormatter : function(rowIndex, rowData){
        return '<div>ROW DATA</div>';
    }
});
```
