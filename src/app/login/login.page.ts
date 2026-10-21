import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
  }

  login() {

    // Cek input kosong
    if (!this.username || !this.password) {

      alert('Username dan password harus diisi.');

      return;
    }

    // Kirim username dan password ke PHP
    this.http.post<any>(
      'http://localhost/educluster_api/login.php',
      {
        username: this.username,
        password: this.password
      }
    ).subscribe({

      next: (response) => {

        console.log('RESPONS LOGIN:', response);

        // Jika login berhasil
        if (response.status === true) {

          // Simpan status login
          localStorage.setItem('isLoggedIn', 'true');

          // Simpan ID admin
          localStorage.setItem(
            'id_admin',
            String(response.id_admin)
          );

          // Simpan username
          localStorage.setItem(
            'username',
            response.username
          );

          console.log(
            'ID ADMIN TERSIMPAN:',
            localStorage.getItem('id_admin')
          );

          console.log(
            'USERNAME TERSIMPAN:',
            localStorage.getItem('username')
          );

          alert('Login berhasil.');

          // Masuk ke Dashboard dan mengganti halaman login
          this.router.navigate(
            ['/tabs/tab1'],
            { replaceUrl: true }
          );

        }

        // Jika username/password salah
        else {

          alert(response.message);

        }

      },

      // Jika PHP/server tidak dapat dihubungi
      error: (error) => {

        console.error('ERROR LOGIN:', error);

        alert(
          'Tidak dapat terhubung ke server.'
        );

      }

    });

  }

}