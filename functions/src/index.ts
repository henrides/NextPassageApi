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

    const passages: any = [];
    const passagesP: any = [];
    request.body.trips.forEach((trip: any) => {
        passagesP.push(admin.database().ref('/tripUpdates/' + trip.route + '/' + trip.stop).once('value').then((data: any) => {
            console.log(JSON.stringify(data));
            passages.push({
                route: trip.route,
                stop: trip.stop,
                passages: data.val().nextPassages
            });
        }).catch((error: any) => {
            console.log(JSON.stringify(error));
        }));
    });

    Promise.all(passagesP).then(() => {
        response.send(passages);
    }).catch((error: any) => {
        console.log(JSON.stringify(error));
    });
});

exports.api = functions.https.onRequest(app);
