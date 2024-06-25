function runForm() {
    number = document.forms[0].howmany.value;
    console.log("one order of "+number+" strawberries coming up!");
    var formData = {
        "howmany": $("#howmany").val(),
        "sugar": $("#sugar").val(),
        "notes": $("#notes").val()
    }
    console.log(formData);
    $.post( "http://breakthru.local:5000/", formData, function( response ) {
    console.log(response);
    alert( response );
    });
}

function query_orders() {
    $( document ).ready(function() {
        $.getJSON("http://breakthru.local:5000/",
        function(response) {
            console.log(response)
            if (response.length > 0) {
                $('#no_orders_msg').remove();
            }
            $.each(response, function(index, element) {
                msg = "Order "+(index+1)+": ";
                msg += element.howmany+" Strawbs";
                msg += " sugar: "+ element.sugar;
                if (element.notes) {
                    msg += " notes: " + element.notes;
                }
                $('#orders_list').append($('<li>', {
                    text: msg
                }));
            });
        });
    });
}