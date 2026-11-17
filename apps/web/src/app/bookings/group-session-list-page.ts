import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingApi, type Discipline, type GroupSession } from './booking-api';
import { bookingErrorMessage } from './booking-message';

@Component({
  selector: 'app-group-session-list-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './group-session-list-page.html',
  styleUrl: './group-session-list-page.scss',
})
export class GroupSessionListPage {
  private readonly api = inject(BookingApi);
  private readonly route = inject(ActivatedRoute);
  readonly disciplines = signal<Discipline[]>([]);
  readonly selectedDisciplineId = signal('');
  readonly sessions = signal<GroupSession[]>([]);
  readonly loading = signal(false);
  readonly loadingDisciplines = signal(true);
  readonly error = signal('');
  readonly groupedSessions = computed(() => {
    const groups = new Map<string, GroupSession[]>();
    for (const session of this.sessions()) {
      groups.set(session.date, [...(groups.get(session.date) ?? []), session]);
    }
    return [...groups.entries()].map(([date, sessions]) => ({ date, sessions }));
  });

  constructor() {
    void this.loadDisciplines();
  }

  async loadDisciplines(): Promise<void> {
    this.loadingDisciplines.set(true);
    this.error.set('');
    try {
      const disciplines = await this.api.listDisciplines();
      this.disciplines.set(disciplines);
      const requested = this.route.snapshot.queryParamMap.get('disciplineId');
      const selected = disciplines.some(({ id }) => id === requested)
        ? requested!
        : '';
      this.selectedDisciplineId.set(selected);
      if (selected) {
        await this.loadSessions(selected);
      }
    } catch (error) {
      this.disciplines.set([]);
      this.sessions.set([]);
      this.error.set(bookingErrorMessage(error));
    } finally {
      this.loadingDisciplines.set(false);
    }
  }

  async selectDiscipline(disciplineId: string): Promise<void> {
    this.selectedDisciplineId.set(disciplineId);
    this.sessions.set([]);
    if (disciplineId) {
      await this.loadSessions(disciplineId);
    }
  }

  async loadSessions(disciplineId = this.selectedDisciplineId()): Promise<void> {
    if (!disciplineId) {
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      this.sessions.set(await this.api.listGroupSessions(disciplineId));
    } catch (error) {
      this.sessions.set([]);
      this.error.set(bookingErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  availabilityLabel(session: GroupSession): string {
    switch (session.availability) {
      case 'AVAILABLE':
        return `${session.availableSpots} plazas disponibles de ${session.capacity}`;
      case 'FULL':
        return 'Completa';
      case 'WINDOW_CLOSED':
        return 'Ventana de reserva cerrada';
      case 'BOOKED':
        return 'Ya tienes esta clase reservada';
      case 'CONFLICT':
        return 'Tienes otra actividad en este horario';
      default:
        return 'No disponible';
    }
  }
}
