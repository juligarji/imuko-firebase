import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
import { Observable, } from 'rxjs';
import { map } from 'rxjs/operators';

const requestify = require('requestify')

const COLLECTION = 'content'
const LENGTH_LIMIT = 2
const API_URL = 'https://jsonplaceholder.typicode.com/posts'

interface Registry {
    userId:any
    id:number
    title:string
    body:string
}

admin.initializeApp()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });



function readFromApi():Observable<Registry[]>{
    return Observable.of(requestify.get(API_URL))
            .pipe(
                map(object =>{
                    return <Registry[]> object.getBody()
                })
            )
}

function getRandomObjects(ammount:number,sourceArray:Registry[]){
    let randomArray:Registry[] =  []
    let length = sourceArray.length

    for(var i = 0; i<ammount;i++)
    {
        randomArray.push(sourceArray[Math.floor(Math.random() * length) + 0 ])
    }
    return randomArray
}

function parseToHtml(text:string){
   return "<p> ".concat(text).concat(" </p>")
}



export const loadContent = functions.https.onRequest((request, response) => {

 });
