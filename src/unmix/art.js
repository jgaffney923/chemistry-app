export function toolArt(scene, id, x = 0, y = 0, scale = 1) {
  const art = scene.add.container(x, y);
  const picture = scene.add.graphics();
  art.add(picture);
  picture.lineStyle(8, 0x352d4d);
  if (id === 'sieve' || id === 'skim') {
    picture.fillStyle(0xd6e1e6).fillEllipse(-15, 0, 130, 90);
    picture.strokeEllipse(-15, 0, 130, 90);
    picture.lineStyle(12, 0xd6e1e6).lineBetween(45, 0, 100, 0);
    picture.lineStyle(4, 0x536978);
    for (let offset = -40; offset <= 40; offset += 20) {
      picture.lineBetween(-65, offset / 2, 35, offset / 2);
      if (id === 'sieve') picture.lineBetween(offset - 15, -30, offset - 15, 30);
    }
  } else if (id === 'magnet') {
    const bend = [{ x: -50, y: -40 }, { x: -50, y: 20 }, { x: -35, y: 50 }, { x: 0, y: 60 }, { x: 35, y: 50 }, { x: 50, y: 20 }, { x: 50, y: -40 }];
    picture.lineStyle(44, 0x352d4d).strokePoints(bend);
    picture.lineStyle(30, 0xf27262).strokePoints(bend);
    picture.fillStyle(0xe0e8ef).fillRect(-67, -55, 34, 30).fillRect(33, -55, 34, 30);
  } else if (id === 'filter') {
    picture.fillStyle(0xfffbef).fillTriangle(-75, -55, 75, -55, 0, 65);
    picture.strokeTriangle(-75, -55, 75, -55, 0, 65);
    picture.lineStyle(5, 0x9bb2bb).lineBetween(-45, -35, 0, 45).lineBetween(45, -35, 0, 45);
  } else {
    picture.fillStyle(0x9cdbed).fillRect(-85, -75, 150, 135);
    picture.lineStyle(8, 0xffffff).strokeRect(-85, -75, 150, 135).lineBetween(-10, -75, -10, 60).lineBetween(-85, -5, 65, -5);
    picture.fillStyle(0xffd84d).fillCircle(40, -45, 28);
    picture.fillStyle(0xffffff).fillTriangle(15, 65, 45, 45, 45, 85).fillTriangle(45, 65, 75, 45, 75, 85);
  }
  return art.setScale(scale);
}

export function grainArt(scene, kind, x, y, size = 1) {
  let grain;
  if (kind === 'pebbles') grain = scene.add.ellipse(x, y, 44, 32, 0x81949e).setStrokeStyle(4, 0x4e626c);
  else if (kind === 'iron') grain = scene.add.rectangle(x, y, 27, 9, 0x46535c).setAngle((x + y) % 90);
  else if (kind === 'cork') grain = scene.add.rectangle(x, y, 42, 30, 0xc68c52).setStrokeStyle(3, 0x936036);
  else if (kind === 'salt') grain = scene.add.rectangle(x, y, 25, 25, 0xffffff).setStrokeStyle(3, 0x95adbb);
  else grain = scene.add.circle(x, y, 10, 0xd5af6b).setStrokeStyle(2, 0xa68040);
  return grain.setScale(size);
}

export function vessel(scene, x, y, width = 520) {
  const cup = scene.add.container(x, y);
  const outline = scene.add.graphics();
  const half = width / 2;
  outline.lineStyle(9, 0xd4eaf0).beginPath().moveTo(-half, -180).lineTo(-half + 40, 145).lineTo(half - 40, 145).lineTo(half, -180).strokePath();
  outline.lineStyle(5, 0xd4eaf0, 0.4).lineBetween(-half + 35, -130, -half + 65, 105);
  cup.add(outline);
  return cup;
}

export function waterArt(scene, x, y, width = 440) {
  return scene.add.rectangle(x, y, width, 190, 0xa9e1f1, 0.38).setStrokeStyle(3, 0xbceefa, 0.6);
}

export function prepareUnmixArt(scene) {
  for (const kind of ['iron', 'cork']) {
    const key = `item-${kind}`;
    if (scene.textures.exists(key)) continue;
    const picture = scene.make.graphics({ add: false });
    if (kind === 'cork') {
      picture.fillStyle(0xc68c52).fillRoundedRect(35, 60, 170, 120, 12);
      picture.lineStyle(8, 0x674834).strokeRoundedRect(35, 60, 170, 120, 12);
      picture.fillStyle(0x936036);
      for (let index = 0; index < 12; index++) picture.fillCircle(60 + index % 4 * 40, 85 + Math.floor(index / 4) * 30, 5);
    } else {
      picture.fillStyle(0x46535c);
      picture.lineStyle(4, 0x9bafb9);
      for (let index = 0; index < 5; index++) {
        const x = 35 + index % 3 * 62;
        const y = 60 + Math.floor(index / 3) * 75;
        picture.fillRect(x, y, 50, 20).strokeRect(x, y, 50, 20);
      }
    }
    picture.generateTexture(key, 240, 240);
    picture.destroy();
  }
}