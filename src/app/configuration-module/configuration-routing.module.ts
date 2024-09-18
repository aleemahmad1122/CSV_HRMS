import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedGuard } from '../shared/guards/protected.guard';

const routes: Routes = [
  {
    path: '', children: [
      {
        path: 'banks',
        loadComponent: () => import(`./view-banks/view-banks.component`).then(c => c.ViewBanksComponent),
        title:'Manage Banks',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'add-bank',
        loadComponent: () => import(`./add-edit-bank/add-edit-bank.component`).then(c => c.AddEditBankComponent),
        title:'Add Bank',
        canActivate: [ProtectedGuard]
      },

      {
        path: 'edit-bank',
        loadComponent: () => import(`./add-edit-bank/add-edit-bank.component`).then(c => c.AddEditBankComponent),
        title:'Edit Bank',
        canActivate: [ProtectedGuard]
      },
      //---------------------------------------------------------------------------------------------------------------------------

      //---------------------------------------------------------------------------------------------------------------------------
      {
        path: 'locations',
        loadComponent: () => import(`./view-locations/view-locations.component`).then(c => c.ViewLocationsComponent),
        title:'Manage Locations',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'add-location',
        loadComponent: () => import(`./add-edit-location/add-edit-location.component`).then(c => c.AddEditLocationComponent),
        title:'Add Location',
        canActivate: [ProtectedGuard]
      },

      {
        path: 'edit-location',
        loadComponent: () => import(`./add-edit-location/add-edit-location.component`).then(c => c.AddEditLocationComponent),
        title:'Edit Location',
        canActivate: [ProtectedGuard]
      },
      //---------------------------------------------------------------------------------------------------------------------------

      {
        path: 'users',
        loadComponent: () => import(`./view-users/view-users.component`).then(c => c.ViewUsersComponent),
        title:'Manage Users',
        canActivate: [ProtectedGuard]
      }, 
      {
        path: 'add-user',
        loadComponent: () => import(`./add-edit-user/add-edit-user.component`).then(c => c.AddEditUserComponent),
        title:'Add User',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'edit-user',
        loadComponent: () => import(`./add-edit-user/add-edit-user.component`).then(c => c.AddEditUserComponent),
        title:'Edit User',
        canActivate: [ProtectedGuard]
      },
    
    //---------------------------------------------------------------------------------------------------------------------------
      {
        path: 'customers',
        loadComponent: () => import(`./view-customers/view-customers.component`).then(c => c.ViewCustomersComponent),
        title:'Manage Customers',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'add-customer',
        loadComponent: () => import(`./add-edit-customer/add-edit-customer.component`).then(c => c.AddEditCustomerComponent),
        title:'Add Customer',
        canActivate: [ProtectedGuard]
      },

      {
        path: 'edit-customer',
        loadComponent: () => import(`./add-edit-customer/add-edit-customer.component`).then(c => c.AddEditCustomerComponent),
        title:'Edit Customer',
        canActivate: [ProtectedGuard]
      },
    
      //---------------------------------------------------------------------------------------------------------------------------      
      {
        path: 'suppliers',
        loadComponent: () => import(`./view-suppliers/view-suppliers.component`).then(c => c.ViewSuppliersComponent),
        title:'Manage Suppliers',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'add-supplier',
        loadComponent: () => import(`./add-edit-supplier/add-edit-supplier.component`).then(c => c.AddEditSupplierComponent),
        title:'Add Supplier',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'edit-supplier',
        loadComponent: () => import(`./add-edit-supplier/add-edit-supplier.component`).then(c => c.AddEditSupplierComponent),
        title:'Edit Supplier',
        canActivate: [ProtectedGuard]
      },
      //---------------------------------------------------------------------------------------------------------------------------
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
export class ConfigurationRoutingModule { }
