import { Routes } from '@angular/router';
import { HomeComponent } from './navigation/home/home.component';
import { ListaProdutoComponent } from './tests/lista-produto/lista-produto.component';
import { ReturnBalanceComponent } from './tests/return-balance/return-balance.component';


export const rootRouterConfig: Routes = [
    {path: '', redirectTo: '/home',pathMatch: 'full'},
    {path: 'home' , component : HomeComponent},
    {path : 'lista-produto' , component : ListaProdutoComponent},
    {path : 'balance' , component :  ReturnBalanceComponent}

    
];