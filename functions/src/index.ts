import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';

admin.initializeApp();

const app = express();

app.route('/nextPassages').post((request, response) => {
    console.log(JSON.stringify(request.body));
    if (!request || !request.body || !request.body.trips) {
        response.status(400).send('No trips');
        return;
    }

    const passagesP: any = [];
    request.body.trips.forEach((trip: any) => {
        passagesP.push(admin.database().ref('/tripUpdates/' + trip.route + '/' + trip.stop).once('value'));
    });

    Promise.all(passagesP).then((values) => {
        response.send(values.map((x: any) => {
            console.log(JSON.stringify(x.val()));
            return {
                route: x.val().routeId,
                stop: x.val().stopId,
                passages: x.val().nextPassages
            };
        }));
    }).catch((error: any) => {
        console.log(JSON.stringify(error));
        response.status(400).send('Invalid trip');
    });
});

exports.api = functions.https.onRequest(app);
