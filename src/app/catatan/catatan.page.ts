import { Component } from '@angular/core';


@Component({

  selector: 'app-catatan',

  templateUrl: './catatan.page.html',

  styleUrls: ['./catatan.page.scss'],

  standalone: false,

})


export class CatatanPage {


  catatanTerbuka:number = 0;



  bukaCatatan(id:number){


    if(this.catatanTerbuka === id){

      this.catatanTerbuka = 0;

    }

    else{

      this.catatanTerbuka = id;

    }


  }


}