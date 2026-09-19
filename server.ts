import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Client Summary Endpoint
  app.post("/api/ai/client-summary", async (req, res) => {
    try {
      const { client, projects, invoices, transactions } = req.body;

      if (!client) {
        return res.status(400).json({ error: "Données du membre / client manquantes" });
      }

      // Check if GEMINI_API_KEY is available
      if (!process.env.GEMINI_API_KEY) {
        // Return structured administrative summary as fallback
        const totalPaid = (invoices || [])
          .filter((inv: any) => inv.status === 'paid')
          .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
        const lateAmount = client.outstandingBalance || 0;

        return res.json({
          summary: `### Synthèse Administrative & Financière (Nexus IA)\n\n` +
            `**Adhérent :** ${client.name} ${client.bureauRole ? `— *${client.bureauRole}*` : ''}\n` +
            `**Statut :** ${client.memberStatus === 'active' ? 'Adhérent Actif' : client.memberStatus === 'radiated' ? 'Radié' : 'Suspendu'}\n\n` +
            `#### 1. Bilan Financier & Cotisations\n` +
            `- Total cotisé / réglé : **${client.totalBilled ? client.totalBilled.toLocaleString('fr-FR') : totalPaid.toLocaleString('fr-FR')} FCFA**\n` +
            `- Arriéré actuel : **${lateAmount.toLocaleString('fr-FR')} FCFA** ${lateAmount > 0 ? '(Pénalité de retard applicable)' : '(À jour de cotisations)'}\n\n` +
            `#### 2. Historique des Activités\n` +
            `- **${invoices?.length || 0}** quittance(s) ou facture(s) émise(s).\n` +
            `- **${projects?.length || 0}** projet(s) ou commission(s) de travail relié(s).\n` +
            `- **${transactions?.length || 0}** versement(s) comptabilisé(s) en trésorerie.\n\n` +
            `#### 3. Recommandation Bureau & Trésorerie\n` +
            `${lateAmount > 0 ? '⚠️ Envoyer une notification de rappel pour régulariser l’arriéré avant la prochaine assemblée générale.' : '✅ Adhérent en règle. Profil régulier et exemplaire au sein de la communauté.'}`,
          isFallback: true,
        });
      }

      const ai = getGeminiClient();

      const prompt = `Tu es le conseiller expert en gestion administrative, financière et tontinière de la plateforme Nexus Gestion.
Rédige une note de synthèse claire, percutante et bien structurée (en français) pour la fiche de cet adhérent / client :

DONNÉES DU MEMBRE / CLIENT :
- Nom complet : ${client.name} (${client.firstName || ''} ${client.lastName || ''})
- Téléphone : ${client.phone || 'Non renseigné'}
- Email : ${client.email || 'Non renseigné'}
- Rôle au sein du bureau : ${client.bureauRole || 'Membre simple'}
- Statut d'adhésion : ${client.memberStatus || 'Actif'}
- Total cotisé / facturé : ${client.totalBilled || 0} FCFA
- Arriéré / Solde dû : ${client.outstandingBalance || 0} FCFA
- Date d'enregistrement : ${client.createdAt || 'Non renseignée'}
- Notes sur le membre : ${client.notes || 'Aucune note'}

HISTORIQUE DES FACTURES ET APPELS DE FONDS (${invoices?.length || 0} au total) :
${(invoices || []).slice(0, 8).map((inv: any) => `- N°${inv.number} (${inv.issueDate}) : ${inv.total} FCFA [Statut: ${inv.status}, Réglé: ${inv.amountPaid} FCFA]`).join('\n') || 'Aucune facture'}

HISTORIQUE DES PROJETS / COMMISSIONS (${projects?.length || 0} au total) :
${(projects || []).slice(0, 6).map((p: any) => `- ${p.title} (${p.category}) : Budget ${p.budget} FCFA, Progression: ${p.progress}%, Statut: ${p.status}`).join('\n') || 'Aucun projet'}

HISTORIQUE TRÉSORERIE (${transactions?.length || 0} opérations) :
${(transactions || []).slice(0, 8).map((t: any) => `- ${t.date} : [${t.type === 'income' ? 'Entrée' : 'Sortie'}] ${t.category} (${t.amount} FCFA) - ${t.description}`).join('\n') || 'Aucune transaction'}

Consignes pour la note de synthèse :
1. Format Markdown clair et soigné avec des sections bien distinctes.
2. Section 1 : Situation de l'adhérent (rôle au sein de l'organisation, assiduité).
3. Section 2 : Analyse financière (ponctualité des cotisations, niveau d'engagement, régularité).
4. Section 3 : Participation aux projets ou initiatives.
5. Section 4 : Recommandation claire pour le Bureau Exécutif ou le Trésorier (ex: relance, félicitations, attribution d'un rôle, éligibilité à la tontine).`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
      });

      res.json({
        summary: response.text || "Note de synthèse indisponible.",
      });
    } catch (err: any) {
      console.error("Erreur serveur résumé IA:", err);
      res.status(500).json({ error: err.message || "Erreur interne lors de la génération du résumé IA" });
    }
  });

  // Vite middleware in dev / static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus Gestion server running on port ${PORT}`);
  });
}

startServer();
