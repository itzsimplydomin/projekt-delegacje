using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using DelegacjaAPI.Models;

namespace DelegacjaAPI.Pdf
{
    public class DelegacjaPdf : IDocument
    {
        private readonly Delegacja _d;

        public DelegacjaPdf(Delegacja delegacja)
        {
            _d = delegacja;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Margin(30);

                page.Content().Column(col =>
                {
                    col.Item().Text("Delegacja służbowa")
                        .FontSize(20).Bold();

                    col.Item().Text($"Email: {_d.UserEmail}");
                    col.Item().Text($"Miejsce: {_d.Miejsce}");
                    col.Item().Text($"Od: {_d.DataRozpoczecia:yyyy-MM-dd HH:mm}");
                    col.Item().Text($"Do: {_d.DataZakonczenia:yyyy-MM-dd HH:mm}");
                    col.Item().Text($"Uwagi: {_d.Uwagi}");
                });
            });
        }
    }
}
