import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedGuard } from '../shared/guards/protected.guard';

const routes: Routes = [
  {
    path: '', children: [
      //---------------------------------------------------------------------------------------------------------------------------
      {
        path: 'expense-sheet',
        loadComponent: () => import(`./view-expense-sheet/view-expense-sheet.component`).then(c => c.ViewExpenseSheetComponent),
        title:'Manage Expense Sheet',
        canActivate: [ProtectedGuard]
      },
      {
        path: 'add-expense-sheet',
        loadComponent: () => import(`./add-edit-expense-sheet/add-edit-expense-sheet.component`).then(c => c.AddEditExpenseSheetComponent),
        title:'Add Expense Sheet',
        canActivate: [ProtectedGuard]
      },

      {
        path: 'edit-expense-sheet',
        loadComponent: () => import(`./add-edit-expense-sheet/add-edit-expense-sheet.component`).then(c => c.AddEditExpenseSheetComponent),
        title:'Edit Expense Sheet',
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
export class ExpenseRoutingModule { }
