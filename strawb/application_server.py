from flask import Flask, request, make_response, jsonify

app = Flask(__name__)

all_strawbs_orders = []

@app.route('/', methods=['POST'])
def parse_request():
    print(request.path)
    if request.form:
        all_strawbs_orders.append(request.form.to_dict())
    response = make_response("ok", 201)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/', methods=['GET'])
def display_all():
    response = jsonify(all_strawbs_orders)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/cancel', methods=['POST'])
def cancel_order():
    order = int(request.form["order"])
    print("cancelling order", order)
    del all_strawbs_orders[order-1]
    response = make_response(f"order {order} cancelled", 201)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/deliver', methods=['POST'])
def deliver_order():
    order = int(request.form["order"])
    print("delivering order", order)
    del all_strawbs_orders[order-1]
    response = make_response(f"order {order} marked as delivered", 201)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
