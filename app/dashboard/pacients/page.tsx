import { DataTable } from './components/data-table';
import data from './data.json';

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-2xl font-bold tracking-tight pl-4 lg:pl-6 my-2">
        Istoric pacienți
      </h2>
      <DataTable data={data} />
    </div>
  );
}
