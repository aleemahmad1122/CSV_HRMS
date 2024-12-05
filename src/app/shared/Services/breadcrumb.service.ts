import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<Array<{ label: string, url: string }>>([]);
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
      this.breadcrumbsSubject.next(breadcrumbs);
    });
  }

  private createBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Array<{ label: string, url: string }> = []
  ): Array<{ label: string, url: string }> {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL) {
        url += `/${routeURL}`;
      }

      if (child.snapshot.data['breadcrumb']) {
        let breadcrumbLabel = child.snapshot.data['breadcrumb'];

        // Check if there's an 'action' parameter in the route and append it to the breadcrumb
        if (child.snapshot.params['action']) {
          const action = child.snapshot.params['action'];
          breadcrumbLabel = `${breadcrumbLabel} - ${action.charAt(0).toUpperCase() + action.slice(1)}`; // Capitalize the action
        }

        breadcrumbs.push({ label: breadcrumbLabel, url });
      }

      this.createBreadcrumbs(child, url, breadcrumbs); // Continue without returning early
    }

    return breadcrumbs;
  }
}
