create schema customeridm;

create table customeridm.user_company_relation (user_id varchar(100), record_source varchar(100), vfs_company_code varchar(100));

create unique index user_company_relation_all_idx on customeridm.user_company_relation(user_id, record_source, vfs_company_code);

select * from customeridm.user_company_relation;

insert into customeridm.user_company_relation(user_id, record_source, vfs_company_code)
values ('user1', 'rsA', 'company1');

insert into customeridm.user_company_relation(user_id, record_source, vfs_company_code)
values ('user2', 'rsA', 'company1');


commit;