import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'

import { map, concatMap, toArray } from 'rxjs/operators';
import { from, Observable,  } from 'rxjs';
const requestify = require('requestify')

admin.initializeApp()

const db = admin.firestore()
const COLLECTION = 'content'
const LENGTH_LIMIT = 2
const API_URL = 'https://jsonplaceholder.typicode.com/posts'


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

interface Registry {
    userId:any
    id:number
    title:string
    body:string
}


// Api information Handling functions ...................
function readFromApi(){
    return from(requestify.get(API_URL))
            .pipe(
                map(object =>{
                    return (<any>object).getBody()
                })
            )
}
function parseToHtml(text:string){
    return "<p> ".concat(text).concat(" </p>")
 }

function getRandomObjects(ammount:number,sourceArray:Registry[]){
    const randomArray:Registry[] =  []
    const length = sourceArray.length

    for(let i = 0; i<ammount;i++)
    {
        randomArray.push(sourceArray[Math.floor(Math.random() * length) + 0 ])
    }
    return randomArray
}

/// Firestore Fuctions ...............
function readCollection(){
    return from(db.collection(COLLECTION).get())
            .pipe(
                map(snapshot=>{
                    console.log('read Collection ---');
                        
                        console.log('....................');
                    return snapshot.docs
                })
            )
 }

function editDocument(docID:string,newData:Registry){
    return from(
        db.collection(COLLECTION).doc(docID)
            .update({
                title: newData.title,
                body: parseToHtml(newData.body)
            })
    )
}
function addDocuments(newDocuments:Registry[]){
    const outDocs:Observable<any>[] = []
    newDocuments.forEach(doc=>{
        doc.body = parseToHtml(doc.body)
        outDocs.push(from(db.collection(COLLECTION).add(doc)))
    })
return outDocs
}

export const loadContent = functions.https.onRequest((request, response) => {
    readFromApi()
        .pipe(
            map(apiObjects =>{
                console.log('1');
                return getRandomObjects(LENGTH_LIMIT,apiObjects)
            }),
            concatMap(randomObjects =>{
               console.log("2");
               console.log(randomObjects);

               return readCollection()
                        .pipe(
                            concatMap(collection=>{
                                if(collection.length === 0){
                                    return addDocuments(randomObjects)
                                }
                                const editedDocs = []
                                for(let i=0;i<LENGTH_LIMIT;i++){
                                    editedDocs.push(editDocument(collection[i].id,randomObjects[i]))
                                }                                
                                return editedDocs
                            }),
                            toArray()
                        )
            }),
            concatMap(_=>{
                return readCollection()
                        .pipe(
                            map(docs=>{
                                return docs.map(doc=>{ return doc.data()})
                            })
                        )
            })
        )
        .subscribe(editedDocuments =>{         
            response.send(editedDocuments)
        },error=>{
            response.status(500).send(error)
        })
 });
