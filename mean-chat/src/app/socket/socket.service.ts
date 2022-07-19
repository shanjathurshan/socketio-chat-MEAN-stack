import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import io from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})
export class SocketService {

  readonly uri = 'http://localhost:3000';

  socket : any;

  constructor() {
    this.socket = io(this.uri);
   }


   listen(eventName: string){
    return new Observable(subscriber => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    });
   }

   emit(eventName: string, data: any){
    this.socket.emit(eventName, data);
   }
   
  }
