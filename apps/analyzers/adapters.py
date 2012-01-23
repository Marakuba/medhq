# -*- coding: utf-8 -*-

"""
"""

class AbbotAdapter():
    
    fields_delimiter = "|"
    subfields_delimiter = "^"
    
    header_fields = [
        ['MessageControlID',],
        ['AccessPassword',],
        ['Sender',[
            'Name',
            'SoftwareVersion',
            'SerialNumber',
            'InterfaceVersion'
        ]],
        ['SenderAddress',],
        ['Reserved',],
        ['SenderTelephone',],
        ['SenderCharacteristics',],
        ['RecieverID',[
            'HostName',
            'IPAddress'
        ]],
        ['Comment',],
        ['ProcessingID',],
        ['VersionNumber',],
        ['DateTime',],
    ]
    
    patient_fields = [
        ['SequenceNumber',],
        ['PracticePID',],
        ['LaboratoryPID',],
        ['InstrumentPID',],
        ['PatientName',],
        ['MaidenName',],
        ['Birthdate',],
        ['PatientSex',],
    ]
    
    order_fields = [
        ['SequenceNumber',],
        ['SpecimenID',[
            ['SpecimenID',],
            ['locationID',],
            ['position',],
        ]],
        ['InstrumentSpecimenID',[
            ['SpecimenID',],
            ['locationID',],
            ['position',],
        ]],
        ['UniversalTestID',[
            ['Empty',],
            ['Empty',],
            ['Empty',],
            ['AssayCode',],
            ['AssayName',],
            ['AssayProtocol',],
            ['TestQualifier',],
#            ['ResultQualifier',],
        ]],
        ['Priority',],
        ['RequestedDateTime',],
        ['CollectionDateTime',],
        ['CollectionEndTime',],
        ['CollectionVolume',],
        ['CollectorID',],
        ['ActionCode',],
        ['DangerCode',],
        ['RelevantClinicalInfo',],
        ['DateTimeSpecimenRecieved',],
        ['SpecimenDescriptor',],
        ['OrderingPhysician',],
        ['PhysicianPhone',],
        ['UserField1',],
        ['UserField2',],
        ['LabField1',],
        ['LabField2',],
        ['DateTimeReported',],
        ['InstrumentCharge',],
        ['InstrumentSectionID',],
        ['ReportType',],# F ??
        ['Reserved',],#
        ['LocationCollection',],#
        ['NosocomialInfectionFlag',],#
        ['SpecimenService',],#
        ['SpecimenInstitution',],#
    ]
    
    result_fields = [
        ['SequenceNumber',],
        ['UniversalTestID',[
            ['Empty',],
            ['Empty',],
            ['Empty',],
            ['AssayCode',],
            ['AssayName',],
            ['AssayProtocol',],
            ['TestQualifier',],
            ['Field1',],
            ['Field2',],
            ['Field3',],
            ['ResultType',], # F I P Favg Iavg Pavg
        ]],
        ['Data',],
        ['Units',],
        ['ReferenceRange',],
        ['ResultAbnormalFlags',],  # L H LL HH QC > < EXP
        ['AbnormalityNature',],
        ['ResultStatus',], # F R X
        ['LastCalibrationDate',],
        ['OperatorID',],
        ['DateTimeStarted',],
        ['DateTImeCompleted',],
        ['InstrumentID',],
    ]
    
    comment_fields = [
        ['SequenceNumber',],
        ['CommentSource',], # I D
        ['CommentText',],
        ['CommentType',], # G I 
    ]
    
    def __init__(self, records, **kwargs):
        pass
    
    def parse_subfields(self, field, tpl):
        fields = field.split(self.subfields_delimiter)
        data = self.parse_fields(fields, tpl)
        return data
    
    def parse_fields(self, fields, tpl):
        data = {}
        for i,field in enumerate(fields):
            f = tpl[i]
            data[f[0]] = len(f)==1 and field or self.parse_subfields(field, f[1])
    
    def parse_header_record(self, fields):
        pass

    def parse_patient_record(self, record):
        pass

    def parse_order_record(self, record):
        pass
    
    def parse_result_record(self, record):
        pass
    
    def write_query_message(self, data):
        pass
    