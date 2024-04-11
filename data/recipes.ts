import images from "../constants/images";
import { IRecipe } from "../types/recipe.type";

export const recipes: IRecipe[] = [
  {
    id: "1",
    title: "Le Royal",
    description: "Bonjour les gourmands !\n\nAujourd’hui je vous propose de réaliser un royal ou encore appelé Trianon. Vous êtes beaucoup à me l’avoir réclamé 🙂 , j’ai mis du temps mais le voilà !!!!\n\nLa recette est un peu plus longue que d’habitude mais en soit les différentes étapes (exceptée peut-être la mousse au chocolat) restent simples.",
    image: images.royal,
    preparationTime: 90,
    cookingTime: 30,
    ingredients: [
      {
        title: "Biscuit dacquois",
        items: [
          {
            quantity: 100,
            unit: "g",
            name: "de blancs",
          },
          {
            quantity: 100,
            unit: "g",
            name: "de sucre",
          },
          {
            quantity: 100,
            unit: "g",
            name: "de poudre d’amande ou de noisette",
          },
          {
            quantity: 100,
            unit: "g",
            name: "de sucre glace",
          },
          {
            quantity: 33,
            unit: "g",
            name: "de farine",
          },
        ],
      },
      {
        title: "Croustillant praliné",
        items: [
          {
            quantity: 90,
            unit: "g",
            name: "de chocolat au lait",
          },
          {
            quantity: 60,
            unit: "g",
            name: "de praliné",
          },
          {
            quantity: 75,
            unit: "g",
            name: "de feuillantine",
          },
        ],
      },
      {
        title: "Mousse chocolat",
        items: [
          {
            quantity: 115,
            unit: "g",
            name: "de jaunes d’œufs",
          },
          {
            quantity: 75,
            unit: "g",
            name: "de sucre",
          },
          {
            quantity: 58,
            unit: "g",
            name: "d’eau",
          },
          {
            quantity: 200,
            unit: "g",
            name: "de chocolat noir",
          },
          {
            quantity: 400,
            unit: "g",
            name: "de crème liquide 30% MG",
          },
        ],
      },
    ],
    steps: [
      {
        title: "Le biscuit dacquois",
        actions: [
          "Tamisez le sucre glace, la farine et la poudre d’amande ou noisette selon le choix",
          "En parallèle, montez les blancs avec le sucre semoule jusqu’à obtenir une meringue lisse et brillante.",
          "Versez les poudres sur la meringue et mélangez délicatement à la maryse. On essaie de garder un maximum de volume.",
          "Sur une plaque et une feuille de papier cuisson, dressez deux disques de 18/16cm de diamètre avec une douille unie 8.",
          "Saupoudrez de sucre glace et enfournez 10/15 minutes à 180°C. La cuisson dépend du four donc à surveiller.",
          "Laissez refroidir sur une grille.",
        ],
      },
      {
        title: "Le croustillant",
        actions: [
          "Faites fondre le chocolat et mélangez le au praliné",
          "Ajouter les crêpes dentelles émiettées et mélangez de nouveau.",
          "Taillez un disque de biscuit pour qu’il entre dans le cercle sans toucher les bords.",
          "Déposez le croustillant par-dessus. Bien le tasser.",
          "Le recouvrir d’une feuille de papier cuisson et le réserver au congélateur au minimum 1 heure.",
        ],
      },
      {
        title: "La mousse chocolat",
        actions: [
          "Mélanger au batteur les jaunes d’œufs ensemble.",
          "En parallèle, réalisez le sirop dans une casserole avec l’eau et le sucre qui doit cuire jusqu’à la température de 120°, ne pas dépasser les 121° !",
          "Quand le sirop atteint 121°C, ralentir la vitesse des œufs et versez dessus le sirop tout doucement en filet. Une fois le tout versé, augmentez la vitesse du batteur jusqu’à obtenir une bonne consistance mousseuse. On s’arrête dès qu’on obtient un effet ruban et que la préparation double de volume. La préparation doit couler doucement et ne pas disparaitre immédiatement quand on soulève le batteur.",
          "Ensuite faites fondre le chocolat noir jusqu’à 50 au bain marie. C’est très important pour que la mousse ne fige pas.",
          "Faites monter la crème fermement.",
          "Avec ces 3 éléments prêts, on peut commencer. À l’aide d’un fouet, mélangez rapidement le chocolat à 50°C à la pâte à bombe (jaune d’œufs et sirop). Ne pas traîner afin d’éviter que le chocolat ne durcisse avant d’être bien mélangé ! Une fois le mélange fait, ajoutez un peu de crème et bien mélanger. Ajoutez le reste de crème délicatement pour obtenir une belle mousse.",
        ],
      },
      {
        title: "Le montage",
        actions: [
          "Préparez le cercle inox de 20cm de diamètre et 4,5cm de haut en déposant du rhodoïd sur les parois.",
          "Déposez de la mousse sur les bords du cercle. Ajoutez ensuite le biscuit avec le croustillant au fond.",
          "Ajoutez une partie de la mousse sur le croustillant dans le cercle en faisant bien pénétrer la mousse sur les bords.",
          "Ensuite par-dessus, on vient déposer le deuxième biscuit en appuyant légèrement dessus pour que la mousse remonte sur les côtés.",
          "Terminez par une fine couche de mousse au chocolat par-dessus jusqu’en haut du cercle. Lissez bien le dessus à la spatule.",
          "Déposez l’ensemble idéalement toute une nuit au congélateur, le minimum étant de 5 heures.",
        ],
      },
      {
        title: "La finition",
        actions: [
          "Démoulez l’entremets et enlever le rhodoïd.",
          "Pour décoration simple, saupoudrez le dessus de cacao amer. Vous pourriez faire un glaçage miroir cacao si vous le souhaitez (Recette sur mon blog ou sur ma chaîne youtube).",
          "J’ai ensuite ajouter des amandes hachées, du streusel cacao, des perles en sucre or et des noisettes. La touche finale : je saupoudre de la poudre d’or.",
          "Et voilà l’entremets est terminé,  bonne dégustation !",
        ],
      },
    ],
    createdAt: "2024-04-11T12:18:21.524Z",
    updatedAt: "2024-04-11T12:18:21.524Z",
  },
  {
    id: "2",
    title: "Glaçage miroir base cacao",
    description: "Après plusieurs essais j’ai enfin trouvé la recette du glaçage miroir à base de cacao qui me plait ! Je vous la partage ici :",
    image: images.glacage,
    preparationTime: 30,
    cookingTime: 0,
    ingredients: [
      {
        title: "",
        items: [
          {
            quantity: 145,
            unit: "g",
            name: "de crème liquide entière",
          },
          {
            quantity: 75,
            unit: "g",
            name: "d'eau",
          },
          {
            quantity: 210,
            unit: "g",
            name: "de sucre",
          },
          {
            quantity: 70,
            unit: "g",
            name: "de cacao en poudre amer",
          },
          {
            quantity: 8,
            unit: "g",
            name: "de gélatine",
          },
        ],
      },
    ],
    steps: [
      {
        title: "",
        actions: [
          "Faire tremper les feuilles de gélatine dans de l’eau froide",
          "Réaliser un sirop en portant à ébullition l’eau et le sucre",
          "Ajouter le sirop au cacao en poudre, bien mélanger pour obtenir un mélange homogène",
          "Faire bouillir la crème et ensuite y ajouter la gélatine bien essorée hors du feu. Mélanger pour faire fondre complétement la gélatine.",
          "Ajouter enfin le mélange crème + gélatine au mélange sirop + cacao",
          "Mixer le glaçage en évitant la production de bulles d’air. ( Astuce : Pour enlever des bulles d’air, déposez un film alimentaire à la surface du glaçage puis le retirer )",
          "Tamiser le glaçage ce qui permettra d’avoir quelque chose de lisse.",
          "Laisser refroidir et utiliser à 35°C",
        ],
      },
    ],
    createdAt: "2024-04-11T12:18:21.524Z",
    updatedAt: "2024-04-11T12:18:21.524Z",
  },
  {
    id: "3",
    title: "MugCake Marbré au Nutella",
    description: "Je pense que c'est mon mugcake préféré",
    image: images.mugcake,
    preparationTime: 5,
    cookingTime: 2,
    ingredients: [
      {
        title: "",
        items: [
          {
            quantity: 15,
            unit: "gr",
            name: "de beurre",
          },
          {
            quantity: 25,
            unit: "gr",
            name: "de sucre",
          },
          {
            quantity: 1,
            unit: "",
            name: "oeuf",
          },
          {
            quantity: 1,
            unit: "cueillère",
            name: "de Nutella",
          },
          {
            quantity: 30,
            unit: "gr",
            name: "de farine",
          },
          {
            quantity: 3,
            unit: "cuillère à soupe",
            name: "de concentré de vanille",
          },
        ],
      },
    ],
    steps: [
      {
        title: "",
        actions: [
          "Dans un mug, faire fondre le beurre au micro-ondes",
          "on ajoute le sucre, mélange",
          "on ajoute l'oeuf et l'extrait de vanille, mélange",
          "et on finit par mettre la farine, mélange",
          "on récupère un peu de préparation dans un bol qu'on va mélanger avec le Nutella",
          "on remet la préparation Nutella dans le mug qu'on va remuer à peine pour faire style marbré",
          "Cuire 1m30 au micro-ondes à 500w",
        ],
      },
    ],
    createdAt: "2024-04-11T12:18:21.524Z",
    updatedAt: "2024-04-11T12:18:21.524Z",
  },
]