import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild, effect } from '@angular/core';
import { ClientInterface } from '../../../models/client.interface';
import { ClientProviderService } from '../../../services/clients/client-provider.service';

import { NgZorroModule } from '../../../ng-zorro.module';
import { EventManagerService } from '../../../services/events-manager/event-manager.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ NgZorroModule, CommonModule, RouterModule ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  user = this.eventManager.userLogged();

  viewMode: 'grid' | 'list' = 'grid';
  searchQuery: string = '';

  clientList: ClientInterface[] = [];
  filteredClients: ClientInterface[] = [];
  loadingData: boolean = false;

  defaultImageUrl: string = '../../../../assets/img/no-foto.png';

  @ViewChild('videoModalTemplate', { static: false }) videoModalTemplate!: TemplateRef<any>;

  constructor (
    private clientService: ClientProviderService,
    private eventManager: EventManagerService,
    private router: Router,
    private modal: NzModalService
  ) {
    localStorage.removeItem('clientSelected');
    this.eventManager.clientSelected.set({});
  }

  ngOnInit(): void {
    this.getClientList();
  }

  ngAfterViewInit(): void {
    this.modal.create({
      nzTitle: 'Video presentación',
      nzContent: this.videoModalTemplate,
      nzFooter: null,
      nzCentered: true,
      nzWidth: '727px',
      nzStyle: { 'max-width': '90%' },
      nzClassName: 'video-modal'
    });
  }

  /**
  * Obtiene la lista de clientes del prestador que inicia sesión
  */
  getClientList () {
    this.loadingData = true;
    this.clientService.getClientListByProviderId(this.user.id).subscribe({
      next: (res: any) => {
        this.clientList = res;
        this.applyFilter();
        this.loadingData = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loadingData = false;
      },
      complete: () => {}
    });
  }

  setView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  applyFilter() {
    const query = this.searchQuery.toLowerCase().trim();
    if (query === '') {
      this.filteredClients = this.clientList;
      return;
    }
    this.filteredClients = this.clientList.filter(client =>
      client.clientHoneSolutions?.toLowerCase().includes(query)
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilter();
  }

  /**
  * Redirecciona a la lista de documentos por cargar del cliente seleccionado
  */
  changeOptionClient (item: any) {
    localStorage.setItem('clientSelected', JSON.stringify(item));
    this.eventManager.getDataClient();
    // this.router.navigateByUrl(`/cargar-documentos/${item.idClientHoneSolutions}`);
    this.router.navigateByUrl(`/cumplimiento-documentos/${item.idClientHoneSolutions}`);
  }
}
