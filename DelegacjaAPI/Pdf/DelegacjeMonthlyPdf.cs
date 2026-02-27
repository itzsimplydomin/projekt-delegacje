using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using DelegacjaAPI.Models;

namespace DelegacjaAPI.Pdf
{
    public class DelegacjeMonthlyPdf : IDocument
    {
        private readonly List<Delegacja> _delegacje;
        private readonly int _year;
        private readonly int _month;

        public DelegacjeMonthlyPdf(List<Delegacja> delegacje, int year, int month)
        {
            _delegacje = delegacje;
            _year = year;
            _month = month;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Margin(30);

                page.Content().Column(col =>
                {
                    col.Item().Text($"Raport delegacji - {_month:D2}/{_year}")
                        .FontSize(20).Bold();

                    col.Item().Text($"Liczba delegacji: {_delegacje.Count}");

                    col.Item().PaddingVertical(10);

                    foreach (var d in _delegacje)
                    {
                        col.Item().Text(
                            $"{d.PracownikImie} {d.PracownikNazwisko} | {d.Miejsce} | {d.DataRozpoczecia:yyyy-MM-dd} - {d.DataZakonczenia:yyyy-MM-dd}"
                        );
                    }
                });
            });
        }
    }
}