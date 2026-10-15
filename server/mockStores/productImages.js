// Small, category-specific image sets keep the demo catalog varied while
// ensuring each generated product still shows the kind of item in its title.
const imageUrl = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`;

const imagePools = {
  rugs: [
    imageUrl('photo-1600121848594-d8644e57abab'),
    imageUrl('photo-1579656381226-5fc0f0100c3b'),
    imageUrl('photo-1584100936595-c0654b55a2e2'),
    imageUrl('photo-1767159601823-96d0295344ce'),
    imageUrl('photo-1771838455786-bfe3da93d961'),
    imageUrl('photo-1742301507306-196726872f33'),
    imageUrl('photo-1756362846991-f4509403ec4f'),
    imageUrl('photo-1756362846772-e7dd46679f46'),
    imageUrl('photo-1579005162638-11c872e1586e'),
    imageUrl('photo-1601969698347-664ecffcf994'),
    imageUrl('photo-1560185893-a55cbc8c57e8')
  ],
  furniture: [
    imageUrl('photo-1555041469-a586c61ea9bc'),
    imageUrl('photo-1538688525198-9b88f6f53126'),
    imageUrl('photo-1586023492125-27b2c045efd7'),
    imageUrl('photo-1769017844214-373be474cbe3'),
    imageUrl('photo-1770316320132-e082373dd3f6'),
    imageUrl('photo-1759722667729-eeb3c7b0ff38'),
    imageUrl('photo-1767946876712-c78a132cc317'),
    imageUrl('photo-1773917734704-a89beb096040'),
    imageUrl('photo-1749704648247-cc78c8909ed3')
  ],
  lighting: [
    imageUrl('photo-1507473885765-e6ed057f782c'),
    imageUrl('photo-1498061390976-2b09e3889580'),
    imageUrl('photo-1780816856254-9e880e6fdcda'),
    imageUrl('photo-1782010657327-0a206c93d172'),
    imageUrl('photo-1585347110542-c0389acc4a68'),
    imageUrl('photo-1568872230653-f69a571102a7'),
    imageUrl('photo-1528100315649-ebfe49f792a6'),
    imageUrl('photo-1618221312573-404f9a52798d'),
    imageUrl('photo-1520701005404-6761368ce427'),
    imageUrl('photo-1540730930991-a9286a5f5020')
  ],
  decor: [
    imageUrl('photo-1513519245088-0e12902e5a38'),
    imageUrl('photo-1580485978320-cc2bc7dcf569'),
    imageUrl('photo-1612121499092-89ca1dd4ae88'),
    imageUrl('photo-1607200711767-5f91ad860ae0'),
    imageUrl('photo-1580064141068-f42c18d153f5'),
    imageUrl('photo-1583932295299-397dc35902e7'),
    imageUrl('photo-1597696929736-6d13bed8e6a8'),
    imageUrl('photo-1676534967649-de5853869036'),
    imageUrl('photo-1592178035030-f763d5a84a68'),
    imageUrl('photo-1791474582148-bb1101815ad0')
  ]
};

function poolFor(category = '') {
  const name = category.toLowerCase();
  if (/carpet|rug|runner|dhurrie/.test(name)) return imagePools.rugs;
  if (/furniture|sideboard|armchair/.test(name)) return imagePools.furniture;
  if (/lighting|lamp|lantern/.test(name)) return imagePools.lighting;
  return imagePools.decor;
}

function categoryOffset(category = '') {
  const name = category.toLowerCase();
  if (/runner/.test(name)) return 3;
  if (/dhurrie/.test(name)) return 6;
  return 0;
}

function getProductImage(category, index = 0, sourceOffset = 0) {
  const pool = poolFor(category);
  const productIndex = Math.abs(Number(index) || 0);
  const platformOffset = Math.abs(Number(sourceOffset) || 0);
  return pool[(productIndex + platformOffset + categoryOffset(category)) % pool.length];
}

module.exports = { getProductImage, imagePools };
