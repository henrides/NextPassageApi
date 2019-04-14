import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';

admin.initializeApp();

const app = express();

app.route('/nextPassages').post(async (request, response) => {
    console.log(JSON.stringify(request.body));
    if (!request || !request.body || !request.body.trips) {
        response.status(400).send('No trips');
        return;
    }

    const responseTrips: Array<any> = [];
    for (const trip of request.body.trips) {
        try {
            const passages: any = await admin.database().ref('/tripUpdates/' + trip.route + '/' + trip.stop).once('value');
            const passagesArr: any = passages && passages.val() ? passages.val() : [];
            responseTrips.push({route: trip.route, stop: trip.stop, passages: passagesArr});
        } catch(error) {
            responseTrips.push({route: trip.route, stop: trip.stop, passages: []});
            console.log(JSON.stringify(error));
        }
    }

    response.send(responseTrips);
});

exports.api = functions.https.onRequest(app);
