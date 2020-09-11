import time
import unittest

import vcf_parser

TEST_VCF_FILE1 = 'db/sample.vcf'
TEST_VCF_FILE2 = 'db/sample_snpeffect_tail500.vcf'


class TestVcfParser(unittest.TestCase):

    def test_load(self):
        vcf_obj = vcf_parser.VcfParser()
        vcf_obj.read_vcf_file(TEST_VCF_FILE1)
        self.assertEqual(vcf_obj.df_vcf.shape, (19756, 10))

        # Test get mutations
        muts = vcf_obj.get_mutations()
        print(muts.head())

        # Test write to file
        output_file = f'__out_mutations1_{time.time()}.txt'
        vcf_obj.write_mutations_to_file(output_file)


    def test_load_with_snpeff_data(self):
        vcf_obj = vcf_parser.VcfParser()
        vcf_obj.read_vcf_file(TEST_VCF_FILE2)
        self.assertEqual(vcf_obj.df_vcf.shape, (500, 10))

        # Test get mutations
        muts = vcf_obj.get_mutations()
        print(muts.head())

        # Test write to file
        output_file = f'__out_mutations2_{time.time()}.txt'
        vcf_obj.write_mutations_to_file(output_file)

    def test_parse_protein_mutations(self):
        test_info = \
            "QNAME=hCoV-19_Guangdong_2020XN4373-P0039_2020_EPI_ISL_413851_2020-01-30;QSTART=274;QSTRAND=+;ANN=" \
            "T|synonymous_variant|LOW|ORF1ab|GU280_gp01|transcript|GU280_gp01|" \
            "protein_coding|1/2|c.9C>T|p.Ser3Ser|9/21291|9/21291|3/7096||," \
            "T|synonymous_variant|LOW|ORF1ab|GU280_gp01|transcript|YP_009725297.1|" \
            "protein_coding|1/1|c.9C>T|p.Ser3Ser|9/540|9/540|3/179||WARNING_TRANSCRIPT_NO_STOP_CODON," \
            "T|synonymous_variant|LOW|ORF1ab|GU280_gp01|transcript|YP_009742608.1|" \
            "protein_coding|1/1|c.9C>T|p.Ser3Ser|9/540|9/540|3/179||WARNING_TRANSCRIPT_NO_STOP_CODON," \
            "T|synonymous_variant|LOW|ORF1ab|GU280_gp01|transcript|GU280_gp01.2|" \
            "protein_coding|1/1|c.9C>T|p.Ser3Ser|9/13218|9/13218|3/4405||," \
            "T|upstream_gene_variant|MODIFIER|ORF1ab|GU280_gp01|transcript|YP_009725298.1|" \
            "protein_coding||c.-532C>T|||||532|WARNING_TRANSCRIPT_NO_START_CODON," \
            "T|upstream_gene_variant|MODIFIER|ORF1ab|GU280_gp01|transcript|YP_009742609.1|" \
            "protein_coding||c.-532C>T|||||532|WARNING_TRANSCRIPT_NO_START_CODON," \
            "T|upstream_gene_variant|MODIFIER|ORF1ab|GU280_gp01|transcript|YP_009725299.1|" \
            "protein_coding||c.-2446C>T|||||2446|WARNING_TRANSCRIPT_NO_START_CODON," \
            "T|upstream_gene_variant|MODIFIER|ORF1ab|GU280_gp01|transcript|YP_009742610.1|" \
            "protein_coding||c.-2446C>T|||||2446|WARNING_TRANSCRIPT_NO_START_CODON"

        vcf_obj = vcf_parser.VcfParser()
        muts = vcf_obj._extract_protein_mutations(test_info)
        self.assertEqual(len(muts), 4)
        self.assertEqual(muts[0], 'p.Ser3Ser')
        self.assertEqual(muts[-1], 'p.Ser3Ser')

    def test_convert_protein_mutations(self):
        vcf_obj = vcf_parser.VcfParser()
        muts = ['p.Ser3Ser', 'p.Thr5262Ile']
        new_muts = vcf_obj.convert_protein_mutations_from_3_to_1_letters(muts)
        self.assertEqual(new_muts, ['S3S', 'T5262I'])

        # Bad first letter ('x')
        with self.assertRaisesRegex(ValueError, 'Unexpected format'):
            vcf_obj.convert_protein_mutations_from_3_to_1_letters(['x.Ser3Ser'])

        # Bad acid1 (non-existing)
        with self.assertRaisesRegex(ValueError, 'Cannot recognize acid1'):
            vcf_obj.convert_protein_mutations_from_3_to_1_letters(['p.Xxx3Ser'])

        # Bad acid2 (non-existing)
        with self.assertRaisesRegex(ValueError, 'Cannot recognize acid2'):
            vcf_obj.convert_protein_mutations_from_3_to_1_letters(['p.Ser3Xxx'])


if __name__ == '__main__':
    unittest.main()
