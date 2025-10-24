// Templates de prompts pour l'analyse d'images avec Samy Vision

export interface PromptTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
  format: 'text' | 'json' | 'vision_ok';
  useCases: string[];
  category: string;
}

export interface ResponseFormat {
  id: 'text' | 'json' | 'vision_ok';
  name: string;
  icon: string;
  description: string;
  useCases: string[];
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'technical',
    name: "Analyse technique",
    icon: "🔧",
    description: "Analyse détaillée des éléments techniques",
    prompt: "Analyse technique détaillée de cette image : identifie tous les objets visibles, leurs couleurs, la composition, l'éclairage, l'ambiance générale et les détails techniques. Structure ta réponse en sections claires avec des sous-titres.",
    format: 'text',
    useCases: ["Documentation", "Analyse scientifique", "Inventaire visuel"],
    category: 'analysis'
  },
  {
    id: 'creative',
    name: "Histoire créative",
    icon: "📖",
    description: "Récit imaginatif basé sur l'image",
    prompt: "Raconte une histoire captivante et imaginative basée sur cette image. Inclus les détails visuels, l'atmosphère, les émotions et imagine ce qui se passe ou va se passer. Utilise un style narratif engageant.",
    format: 'text',
    useCases: ["Contenu créatif", "Storytelling", "Inspiration artistique"],
    category: 'creative'
  },
  {
    id: 'commercial',
    name: "Analyse commerciale",
    icon: "💼",
    description: "Évaluation marketing et publicitaire",
    prompt: "Évalue cette image pour une campagne publicitaire : quels sont les points forts visuels, le message transmis, l'impact émotionnel, et les améliorations possibles pour maximiser l'efficacité marketing. Inclus des recommandations concrètes.",
    format: 'json',
    useCases: ["Marketing", "Publicité", "Branding", "Analyse concurrentielle"],
    category: 'business'
  },
  {
    id: 'artistic',
    name: "Analyse artistique",
    icon: "🎨",
    description: "Évaluation esthétique et stylistique",
    prompt: "Analyse artistique approfondie : style visuel, composition, palette de couleurs, techniques utilisées, émotions transmises, message artistique et influences possibles. Inclus une évaluation de la qualité esthétique.",
    format: 'text',
    useCases: ["Critique d'art", "Éducation artistique", "Inspiration créative"],
    category: 'creative'
  },
  {
    id: 'scientific',
    name: "Description scientifique",
    icon: "🔬",
    description: "Analyse objective et factuelle",
    prompt: "Description scientifique objective de cette image : éléments observables, propriétés physiques, contexte environnemental, données mesurables et analyse factuelle. Utilise un langage précis et technique.",
    format: 'json',
    useCases: ["Recherche", "Documentation scientifique", "Analyse forensique"],
    category: 'analysis'
  },
  {
    id: 'emotional',
    name: "Analyse émotionnelle",
    icon: "❤️",
    description: "Évaluation des sentiments et de l'impact psychologique",
    prompt: "Analyse les émotions et l'impact psychologique de cette image : quels sentiments elle évoque, l'ambiance générale, l'impact sur l'observateur et les associations mentales possibles. Inclus une évaluation de l'intensité émotionnelle.",
    format: 'text',
    useCases: ["Thérapie", "Psychologie", "Design UX", "Communication"],
    category: 'analysis'
  },
  {
    id: 'accessibility',
    name: "Analyse d'accessibilité",
    icon: "♿",
    description: "Évaluation pour l'accessibilité et l'inclusion",
    prompt: "Évalue cette image du point de vue de l'accessibilité : contraste des couleurs, lisibilité, obstacles potentiels, adaptations nécessaires pour les personnes en situation de handicap, et recommandations d'amélioration.",
    format: 'json',
    useCases: ["Design inclusif", "Accessibilité web", "Conformité WCAG"],
    category: 'business'
  },
  {
    id: 'safety',
    name: "Analyse de sécurité",
    icon: "🛡️",
    description: "Évaluation des risques et de la sécurité",
    prompt: "Analyse cette image du point de vue de la sécurité : identifie les risques potentiels, les éléments dangereux, les mesures de sécurité nécessaires, et les recommandations pour minimiser les dangers.",
    format: 'text',
    useCases: ["Sécurité au travail", "Prévention", "Formation sécurité"],
    category: 'specialized'
  },
  {
    id: 'educational',
    name: "Contenu éducatif",
    icon: "🎓",
    description: "Création de contenu pédagogique",
    prompt: "Crée du contenu éducatif basé sur cette image : explique les concepts visibles, fournis des informations factuelles, suggère des questions de réflexion, et propose des activités d'apprentissage adaptées à différents niveaux.",
    format: 'text',
    useCases: ["Éducation", "Formation", "E-learning", "Pédagogie"],
    category: 'social'
  },
  {
    id: 'social',
    name: "Analyse sociale",
    icon: "👥",
    description: "Évaluation des aspects sociaux et culturels",
    prompt: "Analyse les aspects sociaux et culturels de cette image : contexte social, dynamiques de groupe, normes culturelles, diversité, inclusion, et impact sur la société. Inclus une perspective critique.",
    format: 'text',
    useCases: ["Sociologie", "Anthropologie", "Études culturelles", "Diversité"],
    category: 'social'
  },
  {
    id: 'environmental',
    name: "Analyse environnementale",
    icon: "🌱",
    description: "Évaluation de l'impact écologique",
    prompt: "Analyse l'impact environnemental de cette image : identifie les éléments naturels, les pratiques durables ou non-durables, l'impact écologique, et les recommandations pour la protection de l'environnement.",
    format: 'json',
    useCases: ["Écologie", "Développement durable", "Conservation", "Éducation environnementale"],
    category: 'specialized'
  },
  {
    id: 'medical',
    name: "Analyse médicale",
    icon: "🏥",
    description: "Évaluation médicale et de santé",
    prompt: "Analyse cette image du point de vue médical : identifie les éléments liés à la santé, les symptômes visibles, les conditions médicales possibles, et les recommandations de santé. ATTENTION : Ne remplace pas un diagnostic médical professionnel.",
    format: 'text',
    useCases: ["Médecine", "Santé publique", "Formation médicale", "Télémédecine"],
    category: 'specialized'
  }
];

export const RESPONSE_FORMATS: ResponseFormat[] = [
  {
    id: 'text',
    name: "Texte libre",
    icon: "📝",
    description: "Description en texte libre, idéal pour la lecture humaine",
    useCases: ["Rapports", "Descriptions", "Contenu créatif"]
  },
  {
    id: 'json',
    name: "JSON structuré",
    icon: "🔧",
    description: "Données structurées pour traitement automatique",
    useCases: ["API", "Traitement automatique", "Intégration système"]
  },
  {
    id: 'vision_ok',
    name: "Vision OK",
    icon: "✅",
    description: "Réponse simple et concise",
    useCases: ["Validation rapide", "Tests", "Confirmation"]
  }
];

export const QUICK_ACTIONS = [
  {
    id: 'describe',
    name: "Décrire simplement",
    prompt: "Décris cette image de manière simple et claire",
    icon: "👁️"
  },
  {
    id: 'summarize',
    name: "Résumer",
    prompt: "Résume cette image en 2-3 phrases",
    icon: "📋"
  },
  {
    id: 'translate',
    name: "Traduire",
    prompt: "Identifie et traduis tous les textes visibles dans cette image",
    icon: "🌐"
  },
  {
    id: 'objects',
    name: "Lister les objets",
    prompt: "Liste tous les objets visibles dans cette image",
    icon: "📦"
  },
  {
    id: 'colors',
    name: "Analyser les couleurs",
    prompt: "Analyse la palette de couleurs de cette image",
    icon: "🎨"
  }
];

export const TEMPLATE_CATEGORIES = {
  analysis: {
    name: "Analyse",
    templates: ['technical', 'scientific', 'artistic', 'emotional']
  },
  creative: {
    name: "Créatif",
    templates: ['creative', 'artistic', 'educational']
  },
  business: {
    name: "Business",
    templates: ['commercial', 'accessibility', 'safety']
  },
  social: {
    name: "Social",
    templates: ['social', 'environmental', 'educational']
  },
  specialized: {
    name: "Spécialisé",
    templates: ['medical', 'safety', 'accessibility', 'environmental']
  }
};

export const getTemplateById = (id: string): PromptTemplate | undefined => {
  return PROMPT_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): PromptTemplate[] => {
  return PROMPT_TEMPLATES.filter(template => template.category === category);
};
