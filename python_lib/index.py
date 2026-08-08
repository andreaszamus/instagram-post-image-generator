# python -m venv .venv
# .venv\Scripts\activate
# python -m flask --app index run

from flask import Flask
from flask_cors import CORS, cross_origin
from flask import request

from PIL import Image, ImageDraw, ImageFont, ImageOps
from io import BytesIO
import base64
import re
import json

app = Flask(__name__)
CORS(app)
is_local = True


def lambda_handler(event, context):
    data = json.loads(event['body'])
    image_as_string = data['image']
    image_data = re.sub('^data:image/.+;base64,', '', image_as_string)
    photo = Image.open(BytesIO(base64.b64decode(image_data)))
    image = Image.open('base2.png')
    image_draw = ImageDraw.Draw(image)

    colour = [
        (76, 76, 78),  # dark grey
        (165, 168, 171),  # light grey
        (255, 255, 255) # white
    ]
    # photo
    image.paste(photo.resize((880, 1122)), (25, 25))

    # icon
    mask = Image.open('mask.png').convert('L')
    icon = Image.open('icon.png')
    output = ImageOps.fit(icon, mask.size, centering=(0.5, 0.5))
    output.putalpha(mask)
    o1 = output.resize((80, 80))
    image.paste(o1, (51, 42), o1)

    # username
    username_font = ImageFont.truetype('OpenSans.ttf', 31)
    image_draw.text((159, 42), data['username'], font=username_font, fill=colour[2])

    # location
    location_font = ImageFont.truetype('OpenSans.ttf', 24)
    image_draw.text((159, 82), data['location'], font=location_font, fill=colour[2])

    # description
    description_font = ImageFont.truetype('OpenSans.ttf', 31)
    description_text = data['description']

    limit = 54

    sentence_split = re.split(r'\n|\r', description_text)

    final = ''
    line = ''
    for sentence in sentence_split:
        if len(sentence) +1 < limit:
            line = sentence + '\n'
            final += line
        else:
            word_split = sentence.split()
            for word in word_split:
                if len(line + word + ' ') < limit:
                    line += word + ' '
                else:
                    final += line + '\n'
                    line = ''
            if line != '':
                final += line

    image_draw.text((25, 1160), final, font=description_font, fill=colour[0])

    # date
    date_font = ImageFont.truetype('OpenSans.ttf', 28)
    image_draw.text((25, 1282), data['date'], font=date_font, fill=colour[1])

    # lines
    image_draw.line([(0, 0), (0, 1343)], fill=colour[1], width=1) # left
    image_draw.line([(0, 0), (931, 0)], fill=colour[1], width=1) # up
    image_draw.line([(930, 0), (930, 1342)], fill=colour[1], width=1)  # right
    image_draw.line([(0, 1342), (930, 1342)], fill=colour[1], width=1)  # down

    final_route = "final.png"
    if is_local:
        pass
    else:
        final_route = f'/tmp/{final_route}'

    image.save(final_route)
    response = Image.open(final_route)
    buffered = BytesIO()
    response.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue())
    if is_local:
        return f'data:image/png;base64, {img_str.decode("utf-8")}'
    else:
        return {
            'statusCode': 200,
            'body': f'data:image/png;base64, {img_str.decode("utf-8")}'
        }


@app.route("/test",  methods=['GET', 'POST'])
def hello_world():
    global is_local
    is_local = True
    event = {
        'body': request.data
    }
    return lambda_handler(event, None)
