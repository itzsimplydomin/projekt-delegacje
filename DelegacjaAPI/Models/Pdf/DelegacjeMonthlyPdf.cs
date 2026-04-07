using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using DelegacjaAPI.Models;

namespace DelegacjaAPI.Models.Pdf
{
    public class DelegacjeMonthlyPdf : IDocument
    {
        private readonly List<Delegacja> _delegacje;
        private readonly int _year;
        private readonly int _month;

        public DelegacjeMonthlyPdf(
            List<Delegacja> delegacje,
            int year,
            int month)
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
                page.Margin(10);

                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("ARTIKON SPÓŁKA CYWILNA GAPIŃSKI ADAM, PAKUŁA KAROL")
                            .FontSize(9)
                            .Bold();
                        col.Item().Text("87-162 Złotoria, Sportowa 2");
                        col.Item().Text("NIP: 8792292180    REGON: 871567710");
                    });

                    row.ConstantItem(120)
                        .AlignRight()
                        .Text(DateTime.Now.ToString("dd.MM.yyyy"));
                });

                page.Content().Column(col =>
                {
                    col.Item().PaddingVertical(6)
                        .Text($"Delegacje {_month:D2}/{_year}")
                        .FontSize(14)
                        .Bold();

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(25);   // Nr
                            columns.ConstantColumn(110);  // Pracownik
                            columns.ConstantColumn(90);   // Miejscowość
                            columns.ConstantColumn(85);   // Data od
                            columns.ConstantColumn(85);   // Data do
                            columns.RelativeColumn();     // Uwagi
                            columns.ConstantColumn(65);   // Wartość
                        });

                        table.Header(header =>
                        {
                            header.Cell().Border(0.5f).Padding(2).Text("Nr").Bold();
                            header.Cell().Border(0.5f).Padding(2).Text("Pracownik").Bold();
                            header.Cell().Border(0.5f).Padding(2).Text("Miejscowość").Bold();
                            header.Cell().Border(0.5f).Padding(2).Text("Data od").Bold();
                            header.Cell().Border(0.5f).Padding(2).Text("Data do").Bold();
                            header.Cell().Border(0.5f).Padding(2).Text("Uwagi").Bold();
                            header.Cell().Border(0.5f).Padding(2).AlignRight().Text("Wartość").Bold();
                        });

                        int i = 1;
                        decimal totalSum = 0;

                        foreach (var d in _delegacje)
                        {
                            var value = CalculateDelegationValue(d);
                            totalSum += value;

                            table.Cell().Border(0.5f).Padding(2).Text(i++.ToString());
                            table.Cell().Border(0.5f).Padding(2).Text($"{d.PracownikImie} {d.PracownikNazwisko}");
                            table.Cell().Border(0.5f).Padding(2).Text(d.Miejsce);
                            table.Cell().Border(0.5f).Padding(2).Text(d.DataRozpoczecia.ToString("dd.MM.yyyy HH:mm"));
                            table.Cell().Border(0.5f).Padding(2).Text(d.DataZakonczenia.ToString("dd.MM.yyyy HH:mm"));
                            table.Cell().Border(0.5f).Padding(2).Text(d.Uwagi ?? "");
                            table.Cell().Border(0.5f).Padding(2).AlignRight().Text($"{value:0.00} zł");
                        }

                        table.Cell()
                            .ColumnSpan(6)
                            .Border(0.5f)
                            .Padding(2)
                            .AlignRight()
                            .Text("Razem:")
                            .Bold();

                        table.Cell()
                            .Border(0.5f)
                            .Padding(2)
                            .AlignRight()
                            .Text($"{totalSum:0.00} zł")
                            .Bold();
                    });
                });
            });
        }

        private decimal CalculateDelegationValue(Delegacja d)
        {
            var start = d.DataRozpoczecia;
            var end = d.DataZakonczenia;

            if (end <= start)
                return 0;

            double totalMinutes = (end - start).TotalMinutes;

            int fullDays = (int)(totalMinutes / (24 * 60));
            double restMinutes = totalMinutes % (24 * 60);

            // Podróż krótsza niż 1 doba
            if (fullDays == 0)
            {
                if (totalMinutes < 8 * 60)
                    return 0;

                if (totalMinutes <= 12 * 60)
                    return 22.5m;

                return 45m;
            }

            // Podróż dłuższa niż 1 doba
            decimal total = fullDays * 45m;

            if (restMinutes > 0)
            {
                if (restMinutes <= 8 * 60)
                    total += 22.5m;
                else
                    total += 45m;
            }

            return total;
        }
    }
}