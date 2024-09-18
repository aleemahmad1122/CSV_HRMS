import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedGuard } from '../shared/guards/protected.guard';

const routes: Routes = [
  {
    path: '', children: [
      //---------------------------------------------------------------------------------------------------------------------------
      {
        path: 'purchase-invoices',
        loadComponent: () => import(`./view-purchase-invoices/view-purchase-invoices.component`).then(c => c.ViewPurchaseInvoicesComponent),
        title:'Manage Purchase Invoices',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'add-purchase-invoice',
        loadComponent: () => import(`./add-edit-purchase-invoice/add-edit-purchase-invoice.component`).then(c => c.AddEditPurchaseInvoiceComponent),
        title:'Add Purchase Invoice',
        canActivate: [ProtectedGuard]
      },

      {
        path: 'edit-purchase-invoice',
        loadComponent: () => import(`./add-edit-purchase-invoice/add-edit-purchase-invoice.component`).then(c => c.AddEditPurchaseInvoiceComponent),
        title:'Edit Purchase Invoice',
        canActivate: [ProtectedGuard]
      },
      //------------------------------------------------------------------------------------------------------------------------------
      
      //---------------------------------------------------------------------------------------------------------------------------
      {
        path: 'sale-invoices',
        loadComponent: () => import(`./view-sale-invoices/view-sale-invoices.component`).then(c => c.ViewSaleInvoicesComponent),
        title:'Manage Sale Invoices',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'add-sale-invoice',
        loadComponent: () => import(`./add-edit-sale-invoice/add-edit-sale-invoice.component`).then(c => c.AddEditSaleInvoiceComponent),
        title:'Add Sale Invoice',
        canActivate: [ProtectedGuard]
      },

      {
        path: 'edit-sale-invoice',
        loadComponent: () => import(`./add-edit-sale-invoice/add-edit-sale-invoice.component`).then(c => c.AddEditSaleInvoiceComponent),
        title:'Edit Sale Invoice',
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
export class InvoiceRoutingModule { }
