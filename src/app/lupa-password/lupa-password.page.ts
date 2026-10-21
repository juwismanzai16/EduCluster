import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-lupa-password',
  templateUrl: './lupa-password.page.html',
  styleUrls: ['./lupa-password.page.scss'],
  standalone: false,
})
export class LupaPasswordPage implements OnInit {

  username: string = '';
  passwordBaru: string = '';
  konfirmasiPassword: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
  }

  ubahPassword() {

    if (!this.username || !this.passwordBaru || !this.konfirmasiPassword) {
      alert('Semua data harus diisi.');
      return;
    }

    if (this.passwordBaru !== this.konfirmasiPassword) {
      alert('Konfirmasi password tidak sesuai.');
      return;
    }

    this.http.post<any>(
      'http://localhost/educluster_api/lupa_password.php',
      {
        username: this.username,
        password_baru: this.passwordBaru
      }
    ).subscribe({
      next: (response) => {

        console.log('RESPONS LUPA PASSWORD:', response);

        if (response.status === true) {
          alert('Password berhasil diubah.');
          this.router.navigate(['/login']);
        } else {
          alert(response.message);
        }

      },
      error: (error) => {
        console.error('ERROR LUPA PASSWORD:', error);
        alert('Tidak dapat terhubung ke server.');
      }
    });
  }

}