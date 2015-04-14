'use strict';

var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();
var opiniones;
var lista;

function init() {
   lista = context.get_web().get_lists().getByTitle("Opiniones");


}



function crearOpinion() {
    
    var ici = SP.ListItemCreationInformation();
    var item = lista.addItem(ici);
    item.set_item("Subject", $("#txtAsunto").val());
    item.set_item("Opinion", $("#txtOpinion").val());

    item.update();
    context.load(item);
    context.executeQueryAsync(function() {
        alert("Opinion Creada con exito");
            listadoOpiniones();
        },
        function(sender, args) {

            alert(args.get_message());
         }
    );

}

function listadoOpiniones() {
   
    opiniones = lista.getItems(new SP.CamlQuery());
    context.load(opiniones);
    context.executeQueryAsync(function() {
        var html = "<ul>";

        var enumeracion = opiniones.getEnumerator();
        while (enumeracion.moveNext()) {
            var item = enumeracion.get_current();
            html += "<li><a href='#' onclick='cargar(" + item.get_item("ID") + ")'>" +
                item.get_item("Subject") +
                "</a> </li>";
        }

        html += "</ul>";

        $("#listado").html(html);


    }, function(sender, args) {
        alert(args.get_message());
    });


}


function cargar(id) {


    var enumeracion = opiniones.getEnumerator();
    while (enumeracion.moveNext()) {

        var item = enumeracion.get_current();
        if (item.get_item("ID") == id) {

        $("#Asunto").html(item.get_item("Subject"));
        $("#texto").html(item.get_item("Opinion"));
        $("#votar").html("<a href='#' onclick='votar(" + id + ")'>Me gusta</a>");
        ContarVotos(id);

        break;


        }
    }

}

function votar(id) {

    var url = _spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getByTitle('Votos')/items";
    var digest = $("#_REQUESTDIGEST").val();
    var obj = {
        BuscadorOpinion: id,
        Positivo: true,
        _metadata: {type:'SP.DATA.VotosListItem'}

    }
    var objtxt = JSON.stringify(obj);
    $.ajax(
        {
            url: url,
            data: objtxt,
            type: 'POST',
            headers: {
                'accept': 'application/json;odata=verbose',
                'content-type': 'application/json',
                'X-RequestDigest': digest


            },
            succes: function() {
                alert("Gracias por el voto");
                cargar(id);
            },
            error: function(err) {
                alert(JSON.stringify(err));

            }

        }
    );
}




function ContarVotos(id) {
    var votos = 0;

    var url = _spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getByTitle('Votos')/items";
    $.ajax({
        url: url + "?$filter=BuscadorOpinion eq " + id,
        type: "GET",
        headers: { "accept": "application/json;odata=verbose" },
        succes: function(res) {
            $.each(res.d.results, function(i, result) {
                if (result.Positivo){
                    votos++;
                    }

            });
            $("#votos").html(votos);
        },
        error: function(err) {
            alert(JSON.stringify(err));
        }

    });


}





$(document).ready(function() {

    $("#btnAddOpinion").click(function () {
        crearOpinion();

    });
    init();
    listadoOpiniones();

});


