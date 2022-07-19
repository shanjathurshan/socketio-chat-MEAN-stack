import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SocketService } from '../socket/socket.service';

@Component({
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.component.html',
  styleUrls: ['./chat-screen.component.scss']
})
export class ChatScreenComponent implements OnInit {

  username = '';
  // mySocketId: String = '';
  mySocketIdLocal: String = '';
  room = '';
  chat = '';

  receiver = '';
  sender = '';

  messageArray : Array<{username: String, message: String }> = [];
  messagePrivateArray : Array<{sender: String, receiver: string, message: String }> = [];
  messagePrivateArrayFromBackend : Array<{sender: String, receiver: string, message: String }> = [];
  userArray: Array<{username: String, id: String, online: boolean }> = [];

  constructor(private socketSerive: SocketService, private http: HttpClient) { 
    this.socketSerive.listen('new user').subscribe( (res: any) =>{
      console.log(res);
      this.messageArray.push(res);
    });

    this.socketSerive.listen('leave user').subscribe( (res: any) =>{
      console.log(res);
      this.messageArray.push(res);
    });

    this.socketSerive.listen('new message').subscribe( (res: any) =>{
      console.log(res);
      this.messageArray.push(res);
    });

    this.socketSerive.listen('message-to-private-user').subscribe( (res: any) =>{
      console.log(res);
      this.messagePrivateArray.push(res)
    });

    this.socketSerive.listen('users').subscribe( (res: any) =>{
      console.log(res);
      this.userArray = res;
    });

    this.socketSerive.listen('messageArray-to-private-user').subscribe( (res: any) =>{
      console.log("messageArray");
      console.log(res);
      this.messagePrivateArrayFromBackend = res;
    });

    // this.socketSerive.listen('my-socket-id').subscribe( (res: any) =>{
    //   this.mySocketId = res;
    //   console.log("my id - "+ res);
    // });


  }

  ngOnInit(): void {

  }

  startRoom(){
    this.socketSerive.emit('join', {username: this.username, room: this.room });
    this.sender = this.username;

        // external purpose
        let MyIndex = this.userArray.findIndex(x => x.username === this.username);
        // this.mySocketIdLocal = this.userArray[MyIndex].id;
        console.log(MyIndex)
  }

  leaveRoom(){
    this.socketSerive.emit('leave', {username: this.username, room: this.room });
  }
  
  sendMessage(){
    this.socketSerive.emit('message', {username: this.username, room: this.room, message: this.chat });
    this.chat = '';
  }

  sendMessagePrivateUser(){
    this.socketSerive.emit('message-to-private-user', {sender: this.sender, receiver: this.receiver, message: this.chat });
    this.messagePrivateArray.push({sender: this.sender, receiver: this.receiver, message: this.chat });
    this.chat = '';

    // external purpose
    let MyIndex = this.userArray.findIndex(x => x.username === this.username);
    this.mySocketIdLocal = this.userArray[MyIndex].id;
  }

  onSelectUser(data: any){
    console.log(data);
    this.receiver = data.username;

    this.http.get<any>(`http://localhost:3000/get_messages/${this.receiver}/${this.sender}`).subscribe(data => {
      console.log(data);
      this.messagePrivateArray = data;
    })
  }

}
