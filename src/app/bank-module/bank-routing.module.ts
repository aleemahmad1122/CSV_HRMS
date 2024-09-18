import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedGuard } from '../shared/guards/protected.guard';

const routes: Routes = [
  {
    path: '', children: [
      //---------------------------------------------------------------------------------------------------------------------------
      {
        path: 'bank-purchase-receipts',
        loadComponent: () => import(`./view-bank-purchase-receipt/view-bank-purchase-receipt.component`).then(c => c.ViewBankPurchaseReceiptComponent),
        title:'Manage Purchase Bank Receipts',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'add-purchase-receipt',
        loadComponent: () => import(`./add-edit-bank-purchase-receipt/add-edit-bank-purchase-receipt.component`).then(c => c.AddEditBankPurchaseReceiptComponent),
        title:'Add Purchase Bank Receipts',
        canActivate: [ProtectedGuard]
      },

      {
        path: 'edit-purchase-receipt',
        loadComponent: () => import(`./add-edit-bank-purchase-receipt/add-edit-bank-purchase-receipt.component`).then(c => c.AddEditBankPurchaseReceiptComponent),
        title:'Edit Purchase Bank Receipts',
        canActivate: [ProtectedGuard]
      },

      //---------------------------------------------------------------------------------------------------------------------------
      {
        path: 'bank-sale-receipts',
        loadComponent: () => import(`./view-bank-sales-receipt/view-bank-sales-receipt.component`).then(c => c.ViewBankSalesReceiptComponent),
        title:'Manage Sale Bank Receipts',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'add-sale-receipt',
        loadComponent: () => import(`./add-edit-bank-sales-receipt/add-edit-bank-sales-receipt.component`).then(c => c.AddEditBankSalesReceiptComponent),
        title:'Add Sale Bank Receipts',
        canActivate: [ProtectedGuard]
      },

      {
        path: 'edit-sale-receipt',
        loadComponent: () => import(`./add-edit-bank-sales-receipt/add-edit-bank-sales-receipt.component`).then(c => c.AddEditBankSalesReceiptComponent),
        title:'Edit Sale Bank Receipts',
        canActivate: [ProtectedGuard]
      },
      
      { 
        path: '**',
        loadChildren: () => import('./../shared/components/page-not-found/page-not-found.component').then(c => c.PageNotFoundComponent),
        title:'Page Not Found'
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BankRoutingModule { }
