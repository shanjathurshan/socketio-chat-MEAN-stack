import { Component, OnInit } from '@angular/core';
import { SocketService } from '../socket/socket.service';

@Component({
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.component.html',
  styleUrls: ['./chat-screen.component.scss']
})
export class ChatScreenComponent implements OnInit {

  username = '';
  mySocketId = '';
  room = '';
  chat = '';
  messageArray : Array<{username: String, message: String }> = [];
  userArray: Array<{username: String, id: String, online: boolean }> = [];

  constructor(private socketSerive: SocketService) { 
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

    this.socketSerive.listen('users').subscribe( (res: any) =>{
      console.log(res);
      this.userArray = res;
    });

    this.socketSerive.listen('my-socket-id').subscribe( (res: any) =>{
      this.mySocketId = res;
      console.log(res);
    });


  }

  ngOnInit(): void {

  }

  startRoom(){
    this.socketSerive.emit('join', {username: this.username, room: this.room });
  }

  leaveRoom(){
    this.socketSerive.emit('leave', {username: this.username, room: this.room });
  }
  
  sendMessage(){
    this.socketSerive.emit('message', {username: this.username, room: this.room, message: this.chat });
    this.chat = '';
  }

}
