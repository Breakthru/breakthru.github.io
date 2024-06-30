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
    query_orders();
    });
}

function mark_delivered(order) {
    $.post( "http://breakthru.local:5000/deliver", {"order": order}, function( response ) {
    console.log(response);
    alert( response );
    query_orders();
    });
}

function mark_cancelled(order) {
    $.post( "http://breakthru.local:5000/cancel", {"order": order}, function( response ) {
    console.log(response);
    alert( response );
    query_orders();
    });
}

function query_orders() {
    $( document ).ready(function() {
        $.getJSON("http://breakthru.local:5000/",
        function(response) {
            $('#orders_list').empty();
            console.log(response);
            if (response.length === 0) {
                $('#orders_list').append($('<li>', {
                    text: "No more orders"
                }));
            }
            $.each(response, function(index, element) {
                msg = "Order "+(index+1)+": ";
                msg += element.howmany+" Strawbs";
                msg += " sugar: "+ element.sugar;
                if (element.notes) {
                    msg += " notes: " + element.notes;
                }
                var description = $('<p>', {
                    text: msg
                });
                var deliver_button = $('<button>', {
                    text: "Deliver",
                    onclick: "javascript:mark_delivered("+(index+1)+");"
                });
                var cancel_button = $('<button>', {
                    text: "Cancel",
                    onclick: "javascript:mark_cancelled("+(index+1)+");"
                });

                var order = $('<li>');
                order.append(description);
                order.append(deliver_button);
                order.append(cancel_button);
                $('#orders_list').append(order);
            });
        });
    });
}