from flask import Flask, request, make_response, jsonify

app = Flask(__name__)

all_strawbs_orders = []

@app.route('/', methods=['POST'])
def parse_request():
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
