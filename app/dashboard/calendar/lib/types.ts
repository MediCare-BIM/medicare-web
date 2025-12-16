
export type Appointment = {
  id: string
  date: string
  start_time: string
  end_time: string
  type: string
  patients: {
    id: string
    name: string
  }
}
