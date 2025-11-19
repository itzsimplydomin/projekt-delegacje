import '/src/styles/App.css';
import { useDelegacje } from '../api/hooks';

export const DelegationsList = () => {
  const { data, isLoading, isError } = useDelegacje();

  if (isLoading) {
    return <p>Ładowanie delegacji...</p>;
  }

  if (isError) {
    return <p>Nie udało się pobrać delegacji. Upewnij się, że backend działa.</p>;
  }

  return (
    <section className="delegations-page">
      <h1>Lista delegacji</h1>
      {!data || data.length === 0 ? (
        <p>Brak zapisanych delegacji.</p>
      ) : (
        <table className="delegations-table">
          <thead>
            <tr>
              <th>Pracownik</th>
              <th>Miejsce</th>
              <th>Data rozpoczęcia</th>
              <th>Data zakończenia</th>
              <th>Uwagi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((delegacja) => (
              <tr key={delegacja.rowKey}>
                <td>
                  {delegacja.pracownikImie} {delegacja.pracownikNazwisko}
                </td>
                <td>{delegacja.miejsce}</td>
                <td>{new Date(delegacja.dataRozpoczecia).toLocaleDateString()}</td>
                <td>{new Date(delegacja.dataZakonczenia).toLocaleDateString()}</td>
                <td>{delegacja.uwagi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default DelegationsList;
