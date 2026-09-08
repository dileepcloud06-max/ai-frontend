import { Injectable, signal } from '@angular/core';

export type LanguageCode = 'en' | 'de';

interface TranslationSet {
  home: string;
  analytics: string;
  productClassification: string;
  reviews: string;
  writeReview: string;
  crm: string;
  notifications: string;
  admin: string;
  profile: string;
  preferences: string;
  signOut: string;
  language: string;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = 'feedback-intelligence-language';
  readonly languages: ReadonlyArray<{ code: LanguageCode; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' }
  ];
  readonly current = signal<LanguageCode>(this.readLanguage());

  private readonly translations: Record<LanguageCode, TranslationSet> = {
    en: {
      home: 'Home', analytics: 'Analytics', productClassification: 'Product Classification',
      reviews: 'Reviews', writeReview: 'Write Review', crm: 'CRM 2.0', notifications: 'Notifications',
      admin: 'Admin', profile: 'Profile', preferences: 'Preferences', signOut: 'Sign out', language: 'Language'
    },
    de: {
      home: 'Startseite', analytics: 'Analysen', productClassification: 'Produktklassifizierung',
      reviews: 'Bewertungen', writeReview: 'Bewertung schreiben', crm: 'CRM 2.0', notifications: 'Benachrichtigungen',
      admin: 'Admin', profile: 'Profil', preferences: 'Einstellungen', signOut: 'Abmelden', language: 'Sprache'
    }
  };

  private readonly pageTranslations: Record<string, string> = {
    'FEEDBACK INTELLIGENCE': 'FEEDBACK-INTELLIGENZ', 'Analytics Overview': 'Analyseübersicht',
    'Refresh Data': 'Daten aktualisieren', 'Refreshing...': 'Wird aktualisiert...',
    'Download Report': 'Bericht herunterladen', 'Preparing...': 'Wird vorbereitet...',
    'Total Reviews': 'Bewertungen insgesamt', 'Positive': 'Positiv', 'Negative': 'Negativ', 'Neutral': 'Neutral',
    'vs last month': 'gegenüber dem letzten Monat', 'Sentiment Distribution': 'Stimmungsverteilung',
    'Data Source': 'Datenquelle', 'Emails Sent': 'Gesendete E-Mails', 'Today': 'Heute', '7 Days': '7 Tage',
    '30 Days': '30 Tage', 'Custom': 'Benutzerdefiniert', 'Emails sent today': 'Heute gesendete E-Mails',
    'Total Sent': 'Insgesamt gesendet', 'Model Performance': 'Modellleistung', 'Model': 'Modell',
    'Accuracy': 'Genauigkeit', 'Precision': 'Präzision', 'Recall': 'Trefferquote', 'F1 Score': 'F1-Wert',
    'Confusion Matrix': 'Konfusionsmatrix', 'Model Metrics': 'Modellmetriken',
    'Top Keywords by Sentiment': 'Top-Schlüsselwörter nach Stimmung', 'Key Insights': 'Wichtige Erkenntnisse',
    'Customer Reviews & Action Center': 'Kundenbewertungen und Aktionszentrum',
    'No Reviews Found': 'Keine Bewertungen gefunden', 'Reset Filters': 'Filter zurücksetzen',
    'Send Resolution Email': 'Lösungs-E-Mail senden', 'Recipient Email': 'Empfänger-E-Mail',
    'Problem Summary': 'Problembeschreibung', 'Suggested Solution': 'Vorgeschlagene Lösung',
    'Cancel': 'Abbrechen', 'Email Sent Successfully!': 'E-Mail erfolgreich gesendet!',
    'Dashboard & Analytics': 'Dashboard und Analysen', 'Write a Review': 'Eine Bewertung schreiben',
    'Reviews': 'Bewertungen', 'AI Assistant': 'KI-Assistent', 'Reports & Insights': 'Berichte und Erkenntnisse',
    'Help & Support': 'Hilfe und Support', 'Welcome back, Urekha': 'Willkommen zurück, Urekha',
    'Product Classification': 'Produktklassifizierung', 'Product reviews': 'Produktbewertungen',
    'How customers feel': 'Wie Kunden sich fühlen', 'View product details': 'Produktdetails anzeigen',
    'Download card': 'Karte herunterladen', 'Main issues': 'Hauptprobleme', 'Show 3 reviews': '3 Bewertungen anzeigen',
    'View all': 'Alle anzeigen', 'Customer Reviews': 'Kundenbewertungen', 'All customer feedback': 'Alle Kundenrückmeldungen',
    'Happy customers': 'Zufriedene Kunden', 'Needs attention': 'Benötigt Aufmerksamkeit', 'Mixed feedback': 'Gemischtes Feedback',
    'Problem': 'Problem', 'Category': 'Kategorie', 'Reason': 'Grund', 'Recommended Solution': 'Empfohlene Lösung',
    'Product name': 'Produktname', 'Product category': 'Produktkategorie', 'Select a category': 'Kategorie auswählen',
    'Rating': 'Bewertung', 'Escalation': 'Eskalation', 'Source': 'Quelle', 'Select a source': 'Quelle auswählen',
    'Custom source': 'Benutzerdefinierte Quelle', 'Review': 'Bewertung', 'Upload Product Image': 'Produktbild hochladen',
    'Remove Image': 'Bild entfernen', 'Help & Workspace Documentation': 'Hilfe und Arbeitsbereich-Dokumentation',
    'Dashboard': 'Dashboard', 'Search tickets, products or email': 'Tickets, Produkte oder E-Mail suchen',
    'Ticket ID': 'Ticket-ID', 'Action': 'Aktion', 'Close': 'Schließen',
    'Investigation': 'Untersuchung', 'Closed': 'Geschlossen', 'Resolved': 'Gelöst',
    'No tickets match your search.': 'Keine Tickets entsprechen Ihrer Suche.', 'Sign in to your account': 'Melden Sie sich an',
    'Username': 'Benutzername', 'Password': 'Passwort', 'Secure access': 'Sicherer Zugriff', 'Sign in': 'Anmelden'
  };

  translate(key: keyof TranslationSet): string {
    return this.translations[this.current()][key];
  }

  setLanguage(language: LanguageCode): void {
    this.current.set(language);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, language);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }

  labelFor(language: LanguageCode): string {
    return this.languages.find(option => option.code === language)?.label ?? language;
  }

  private readLanguage(): LanguageCode {
    if (typeof localStorage === 'undefined') {
      return 'en';
    }

    const stored = localStorage.getItem(this.storageKey);
    return stored === 'de' ? 'de' : 'en';
  }

  constructor() {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = this.current();
    }
  }
}