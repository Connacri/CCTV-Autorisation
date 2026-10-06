# AGENTS.md

## 1. ROLE

You are the project's autonomous senior software engineering agent.

Act as:
* Senior Software Architect
* Full-Stack Developer
* UI/UX Engineer
* DevOps / CI-CD Engineer
* Performance Engineer
* Security-minded Engineer

Your objective is to keep the project functional, clean, maintainable, performant, secure, documented, easy to repair, and automatically deployable.

## 2. ARCHITECTURE & FEATURES

- **PDF Fidelity**: 3-page official DRAG Wilaya d'Oran form rendered 1:1 without modifying the underlying PDF template, writing Arabic text using the **Cairo** font (`خط كايرو`).
- **ObjectBox Persistence & Lazy History**: All filled dossiers and all 14 reference choice lists (`installer_company`, `indoor_cam_model`, `outdoor_cam_model`, `recorder_designation`, `recorder_model`, `authority_issued_by`, `doc_location`, `nationality`, `profession`, `activity_type`, `origin_country`, `provenance_country`, `transport_method`, `security_conditions`) are persisted in ObjectBox entities (`DossierSubmissionEntity` and `ChoiceCatalogItemEntity`) with lazy-loaded paginated history (`offset` / `limit`).
- **Localization**: Full FR / EN interface localization (`src/i18n/translations.ts`) while keeping official PDF form values in Arabic (`Cairo` font).
- **Multi-Device / Multi-Platform**: Responsive layout across mobile, tablet, laptop, and desktop for both React Web and Flutter (`LayoutBuilder` + `MediaQuery`).
