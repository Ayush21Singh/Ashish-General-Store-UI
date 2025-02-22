import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<string> {
    return this.http.post<{ accessToken: string }>(`${this.baseUrl}/api/auth/login`, { username, password })
      .pipe(
        map(response => {
          const token = response.accessToken;
          localStorage.setItem('accessToken', token);
          return token;
        }),
        catchError(error => {
          if (error.status === 409) {
            return throwError(() => ({
              message: error.error.message,
              action: error.error.action
            }));
          }
          return throwError(() => new Error('Login failed'));
        })
      );
  }

  forceLogin(username: string, password: string): Observable<string> {
    return this.http.post<{ accessToken: string }>(`${this.baseUrl}/api/auth/force-login`, { username, password })
      .pipe(
        map(response => {
          const token = response.accessToken;
          localStorage.setItem('accessToken', token);
          return token;
        }),
        catchError(error => throwError(() => new Error('Force login failed')))
      );
  }

  logout(): Observable<void> {
    const token = localStorage.getItem('accessToken');
    return this.http.post<void>(`${this.baseUrl}/api/auth/logout`, null, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(() => {
        this.clearSession();
      }),
      catchError(error => {
        this.clearSession(); // Clear session even if backend fails
        return of(void 0);
      }),
      map(() => {
        this.router.navigate(['/login']);
      })
    );
  }
  

  refreshToken(): Observable<string> {
    return this.http.post<{ accessToken: string }>(`${this.baseUrl}/api/auth/refresh`, null, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        const token = response.accessToken;
        localStorage.setItem('accessToken', token);
        return token;
      }),
      catchError(() => {
        this.clearSession();
        this.router.navigate(['/login']);
        return throwError(() => new Error('Session expired'));
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` });
  }

  private clearSession() {
    localStorage.removeItem('accessToken');
  }

  // CRUD methods (unchanged except baseUrl)
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/admin/inventory/GetAllProducts`, { headers: this.getAuthHeaders() });
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/admin/inventory/GetProductById/${id}`, { headers: this.getAuthHeaders() });
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/admin/inventory/AddProduct`, product, { headers: this.getAuthHeaders() });
  }

  updateProduct(id: number, product: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/admin/inventory/UpdateProduct/${id}`, product, { headers: this.getAuthHeaders() });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/inventory/DeleteProduct/${id}`, { headers: this.getAuthHeaders() });
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/admin/inventory/GetAllCategories`, { headers: this.getAuthHeaders() });
  }

  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/admin/inventory/categoriesById/${id}`, { headers: this.getAuthHeaders() });
  }

  createCategory(category: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/admin/inventory/Addcategory`, category, { headers: this.getAuthHeaders() });
  }

  updateCategory(id: number, category: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/admin/inventory/UpdateCategory/${id}`, category, { headers: this.getAuthHeaders() });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/inventory/DeleteCategory/${id}`, { headers: this.getAuthHeaders() });
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/admin/inventory/GetAllUsers`, { headers: this.getAuthHeaders() });
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/admin/inventory/GetUserbyId/${id}`, { headers: this.getAuthHeaders() });
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/admin/inventory/CreateUser`, user, { headers: this.getAuthHeaders() });
  }

  updateUser(id: number, user: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/admin/inventory/UpdateUser/${id}`, user, { headers: this.getAuthHeaders() });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/admin/inventory/Deleteusers/${id}`, { headers: this.getAuthHeaders() });
  }
}