import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, effect } from '@angular/core';
import { ClientInterface } from '../../../models/client.interface';
import { ClientProviderService } from '../../../services/clients/client-provider.service';

import { NgZorroModule } from '../../../ng-zorro.module';
import { EventManagerService } from '../../../services/events-manager/event-manager.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ NgZorroModule, CommonModule, RouterModule ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  user = this.eventManager.userLogged();

  viewMode: 'grid' | 'list' = 'grid';
  searchQuery: string = '';

  clientList: ClientInterface[] = [];
  filteredClients: ClientInterface[] = [];
  loadingData: boolean = false;

  defaultImageUrl: string = '../../../../assets/img/no-foto.png';

  clientTutorialVisible: boolean = false;

  @ViewChild('videoModalTemplate', { static: false }) videoModalTemplate!: TemplateRef<any>;
  private tutorialSubscription!: Subscription;

  constructor (
    private clientService: ClientProviderService,
    private tutorialService: TutorialService,
    private eventManager: EventManagerService,
    private router: Router,
    private modal: NzModalService,
  ) {
    localStorage.removeItem('clientSelected');
    this.eventManager.clientSelected.set({});
  }

  ngOnInit(): void {
    this.getClientList();
  }

  ngAfterViewInit(): void {
    this.tutorialSubscription = this.tutorialService.stepIndex$.subscribe(step => {
      if (!this.tutorialService.isTutorialFinished()) {
        this.startTutorial(step);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }

  /**
  * Obtiene la lista de clientes del prestador que inicia sesión
  */
  getClientList() {
    this.loadingData = true;
    this.clientService.getClientListByProviderId(this.user.id).subscribe({
      next: (res: any) => {
        this.clientList = res.filter((client: any) => client.active);
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
  changeOptionClient(item: any, activeTutorialStep: boolean = false) {
    if (activeTutorialStep) this.nextTutorialStep();
    localStorage.setItem('clientSelected', JSON.stringify(item));
    this.eventManager.getDataClient();
    // this.router.navigateByUrl(`/cargar-documentos/${item.idClientHoneSolutions}`);
    this.router.navigateByUrl(`/cumplimiento-documentos/${item.idClientHoneSolutions}`);
  }


  /* Tutorial */

  startTutorial(step: number) {
    if (step === 1) {
      this.clientTutorialVisible = false;
      const modalRef = this.modal.create({
        nzTitle: 'VIDEO TUTORIAL',
        nzContent: this.videoModalTemplate,
        nzFooter: null,
        nzCentered: true,
        nzWidth: '900px',
        nzStyle: { 'max-width': '90%' },
        nzClassName: 'video-modal'
      });
      modalRef.afterClose.subscribe((result: any) => {
        this.tutorialService.nextStep();
      });
    } else if (step === 3) {
      this.clientTutorialVisible = true;
    } else {
      this.clientTutorialVisible = false;
    }
  }

  nextTutorialStep() {
    this.clientTutorialVisible = false;
    this.tutorialService.nextStep();
  }

  resetTutorial() {
    this.tutorialService.resetTutorial();
  }
}
