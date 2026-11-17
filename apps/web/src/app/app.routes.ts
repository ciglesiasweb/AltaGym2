import { Route } from '@angular/router';
import { BookingConfirmationPage } from './bookings/booking-confirmation-page';
import { BookingResultPage } from './bookings/booking-result-page';
import { GroupSessionDetailPage } from './bookings/group-session-detail-page';
import { GroupSessionListPage } from './bookings/group-session-list-page';
import { MyBookingsPage } from './bookings/my-bookings-page';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'reservas' },
  { path: 'reservas', component: MyBookingsPage, title: 'Mis reservas' },
  { path: 'reservar', component: GroupSessionListPage, title: 'Reservar clase grupal' },
  {
    path: 'reservar/:groupSessionId/confirmar',
    component: BookingConfirmationPage,
    title: 'Confirmar reserva',
  },
  {
    path: 'reservar/:groupSessionId/resultado',
    component: BookingResultPage,
    title: 'Resultado de la reserva',
  },
  {
    path: 'reservar/:groupSessionId',
    component: GroupSessionDetailPage,
    title: 'Detalle de la clase',
  },
  { path: '**', redirectTo: 'reservas' },
];
