--

SET FOREIGN_KEY_CHECKS = 0;

--

-- Config:
INSERT INTO `config` (`scope`, `path`, `value`, `type`) VALUES ('client', 'general/users/allowRegistration', '1', 3);
INSERT INTO `config` (`scope`, `path`, `value`, `type`) VALUES ('client', 'general/users/allowGuest', '1', 3);
INSERT INTO `config` (`scope`, `path`, `value`, `type`) VALUES ('server', 'players/guestUser/roleId', '2', 2);
INSERT INTO `config` (`scope`, `path`, `value`, `type`) VALUES ('client', 'gameEngine/banner', '0', 3);
INSERT INTO `config` (`scope`, `path`, `value`, `type`) VALUES ('server', 'players/guestUser/allowOnRooms', '1', 3);
UPDATE `config` SET `value` = '{"key":"default_bullet","animationData":{"enabled":true,"type":"spritesheet","img":"default_bullet","frameWidth":64,"frameHeight":64,"start":0,"end":2,"repeat":-1,"frameRate":1}}' WHERE `scope` = 'client' AND `path` = 'skills/animations/default_bullet';
UPDATE `config` SET `value` = '{"key":"default_death","animationData":{"enabled":true,"type":"spritesheet","img":"default_death","frameWidth":64,"frameHeight":64,"start":0,"end":1,"repeat":0,"frameRate":1}}' WHERE `scope` = 'client' AND `path` = 'skills/animations/default_death';

-- Objects:
ALTER TABLE `objects`
	DROP INDEX `id`,
	DROP INDEX `object_class_key`,
	ADD UNIQUE INDEX `object_class_key` (`object_class_key`);

ALTER TABLE `objects_skills`
	CHANGE COLUMN `target` `target_id` TINYINT(3) UNSIGNED NOT NULL AFTER `skill_id`,
	DROP INDEX `FK_objects_skills_target_options`,
	ADD INDEX `FK_objects_skills_target_options` (`target_id`) USING BTREE;
ALTER TABLE `objects_skills`
	DROP FOREIGN KEY `FK_objects_skills_target_options`;
ALTER TABLE `objects_skills`
	CHANGE COLUMN `target_id` `target_id` INT(10) UNSIGNED NOT NULL AFTER `skill_id`,
	ADD CONSTRAINT `FK_objects_skills_target_options` FOREIGN KEY (`target_id`) REFERENCES `target_options` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE `objects_skills`
	DROP FOREIGN KEY `FK_objects_skills_objects`,
	DROP FOREIGN KEY `FK_objects_skills_skills_skill`;
ALTER TABLE `objects_skills`
	ADD CONSTRAINT `FK_objects_skills_objects` FOREIGN KEY (`object_id`) REFERENCES `objects` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	ADD CONSTRAINT `FK_objects_skills_skills_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills_skill` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION;

-- Targets:
ALTER TABLE `target_options`
	CHANGE COLUMN `target_key` `target_key` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_unicode_ci' AFTER `id`;

UPDATE `target_options` SET `target_key` = 'object' WHERE `target_label` = 'Object';
UPDATE `target_options` SET `target_key` = 'player' WHERE `target_label` = 'Player';

-- Skills:
UPDATE `skills_skill_animations` SET `animationData` = '{"enabled":true,"type":"spritesheet","img":"fireball_bullet","frameWidth":64,"frameHeight":64,"start":0,"end":3,"repeat":-1,"frameRate":1,"dir":3}' WHERE `key` = 'bullet';

ALTER TABLE `skills_skill_attack`
	CHANGE COLUMN `attackProperties` `attackProperties` TEXT NULL COLLATE 'utf8mb4_unicode_ci' AFTER `applyDirectDamage`,
	CHANGE COLUMN `defenseProperties` `defenseProperties` TEXT NULL COLLATE 'utf8mb4_unicode_ci' AFTER `attackProperties`,
	CHANGE COLUMN `aimProperties` `aimProperties` TEXT NULL COLLATE 'utf8mb4_unicode_ci' AFTER `defenseProperties`,
	CHANGE COLUMN `dodgeProperties` `dodgeProperties` TEXT NULL COLLATE 'utf8mb4_unicode_ci' AFTER `aimProperties`;

ALTER TABLE `skills_skill_owner_conditions`
    ADD UNIQUE INDEX `key` (`key`),
    ADD UNIQUE INDEX `skill_id_property_key` (`skill_id`, `property_key`);

-- Rooms:
UPDATE `rooms` SET `customData` = '{"allowGuest":true}' WHERE `name` IN ('reldens-house-1', 'reldens-town', 'reldens-forest');
UPDATE `rooms` SET `customData` = NULL WHERE `name` = 'reldens-house-1-2d-floor';
UPDATE `rooms` SET `customData` = '{"allowGuest":true,"gravity":[0,625],"applyGravity":true,"allowPassWallsFromBelow":true,"timeStep":0.012,"type":"TOP_DOWN_WITH_GRAVITY","useFixedWorldStep":false,"maxSubSteps":2,"movementSpeed":160,"usePathFinder":false}' WHERE `name` = 'reldens-gravity';

-- Rewards assets fix:
UPDATE `objects_items_rewards_animations` SET `file` = CONCAT(`file`, '.png') WHERE `file` NOT LIKE '%.png';

-- Items close inventory fix:
UPDATE items_item SET customData = JSON_REMOVE(customData, '$.animationData.closeInventoryOnUse') WHERE JSON_CONTAINS(customData, '{"animationData":{"closeInventoryOnUse":true}}');

--

SET FOREIGN_KEY_CHECKS = 1;

--
